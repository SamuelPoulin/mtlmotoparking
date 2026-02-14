import { APIParking, locations, parkings } from "@/src/lib/db/schema";
import { db } from "@/src/lib/db/drizzle";
import {
  and,
  desc,
  eq,
  getTableColumns,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";

export async function fetchMontrealParkings(): Promise<APIParking[]> {
  const baseUrl = "https://donnees.montreal.ca/api/3/action/datastore_search";

  const params = new URLSearchParams({
    resource_id: "7f1d4ae9-1a12-46d7-953e-6b9c18c78680",
    filters: JSON.stringify({
      CODE_RPA: ["R-MO", "R-MT", "R-TN", "OUT-SDX-12"],
    }),
  });

  const response = await fetch(`${baseUrl}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch parking data: ${response.status}`);
  }

  const data: {
    result: { records: APIParking[] };
  } = await response.json();

  return data.result.records;
}

export async function fetchMapboxAddress(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!accessToken) {
    throw new Error("Missing Mapbox access token");
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    longitude: longitude.toString(),
    latitude: latitude.toString(),
    country: "ca",
    types: "address,street",
  });

  const url = `https://api.mapbox.com/search/geocode/v6/reverse?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Mapbox API error: ${response.status}`);
    return null;
  }

  const data = await response.json();

  return data.features[0]?.properties?.name;
}

const locationKey = (latitude: number, longitude: number) =>
  `${latitude},${longitude}`;

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  if (items.length === 0) return;

  const queue = items.slice();
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (!next) return;
        await worker(next);
      }
    },
  );

  await Promise.all(workers);
}

export async function getParkings() {
  const newParkings = await fetchMontrealParkings();

  const uniqueLocationsMap = new Map<
    string,
    { latitude: number; longitude: number }
  >();
  for (const parking of newParkings) {
    const latitude = Number(parking.Latitude);
    const longitude = Number(parking.Longitude);
    uniqueLocationsMap.set(`${latitude},${longitude}`, { latitude, longitude });
  }

  const uniqueLocations = Array.from(uniqueLocationsMap.values());

  const insertedLocations =
    uniqueLocations.length > 0
      ? await db
          .insert(locations)
          .values(uniqueLocations)
          .onConflictDoNothing()
          .returning({
            id: locations.id,
            latitude: locations.latitude,
            longitude: locations.longitude,
          })
      : [];

  const insertedLocationKeys = new Set(
    insertedLocations.map((row) => locationKey(row.latitude, row.longitude)),
  );

  const remainingLocations = uniqueLocations.filter(
    (loc) =>
      !insertedLocationKeys.has(locationKey(loc.latitude, loc.longitude)),
  );

  const existingLocations =
    remainingLocations.length > 0
      ? await db
          .select({
            id: locations.id,
            latitude: locations.latitude,
            longitude: locations.longitude,
          })
          .from(locations)
          .where(
            or(
              ...remainingLocations.map((loc) =>
                and(
                  eq(locations.latitude, loc.latitude),
                  eq(locations.longitude, loc.longitude),
                ),
              ),
            ),
          )
      : [];

  const locationRows = [...insertedLocations, ...existingLocations];

  const locationIdByKey = new Map(
    locationRows.map((row) => [
      locationKey(row.latitude, row.longitude),
      row.id,
    ]),
  );

  // Normalize and dedupe parkings from the Montreal API
  const processedParkings = new Map();

  for (const parking of newParkings) {
    const latitude = Number(parking.Latitude);
    const longitude = Number(parking.Longitude);
    const location_id = locationIdByKey.get(`${latitude},${longitude}`);

    if (location_id == null) {
      continue;
    }

    const normalized = {
      source_id: Number(parking._id),
      location_id,
      rpa_code: parking.CODE_RPA,
      rpa_description: parking.DESCRIPTION_RPA,
      rep_description: parking.DESCRIPTION_REP,
      rac_description: parking.DESCRIPTION_RAC,
      cat_description: parking.DESCRIPTION_CAT,
      post_id: parking.POTEAU_ID_POT,
      post_version: parking.POTEAU_VERSION_POT,
      post_conception_date: parking.DATE_CONCEPTION_POT,
      sign_id: parking.PANNEAU_ID_PAN,
      sign_rpa_id: parking.PANNEAU_ID_RPA,
      borough: parking.NOM_ARROND,
    };

    const key = [
      normalized.location_id,
      normalized.post_id ?? "",
      normalized.sign_id ?? "",
      normalized.sign_rpa_id ?? "",
      normalized.rpa_code ?? "",
    ].join("|");

    processedParkings.set(key, normalized);
  }

  const finalParkings = Array.from(processedParkings.values());

  if (finalParkings.length > 0) {
    await db
      .insert(parkings)
      .values(finalParkings)
      .onConflictDoUpdate({
        target: [
          parkings.location_id,
          parkings.post_id,
          parkings.sign_id,
          parkings.sign_rpa_id,
          parkings.rpa_code,
        ],
        set: {
          source_id: sql`excluded.source_id`,
          rpa_description: sql`excluded.rpa_description`,
          rep_description: sql`excluded.rep_description`,
          rac_description: sql`excluded.rac_description`,
          cat_description: sql`excluded.cat_description`,
          post_version: sql`excluded.post_version`,
          post_conception_date: sql`excluded.post_conception_date`,
          borough: sql`excluded.borough`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      });

    const staleOrMissing = await db
      .select({
        locationId: locations.id,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(parkings)
      .leftJoin(locations, eq(parkings.location_id, locations.id))
      .where(
        and(
          eq(parkings.rep_description, "Réel"),
          or(
            isNull(locations.address),
            lt(locations.updatedAt, sql`now() - interval '48 hours'`),
          ),
        ),
      );

    const addressTargets = staleOrMissing.filter(
      (location) =>
        location.locationId && location.latitude && location.longitude,
    );

    const MAPBOX_CONCURRENCY = 4;

    const addressUpdates: { id: number; address: string | null }[] = [];

    await runWithConcurrency(
      addressTargets,
      MAPBOX_CONCURRENCY,
      async (loc) => {
        const address = await fetchMapboxAddress(loc.latitude!, loc.longitude!);
        addressUpdates.push({ id: loc.locationId!, address });
      },
    );

    if (addressUpdates.length > 0) {
      const values = addressUpdates.map(
        ({ id, address }) => sql`(${id}::int, ${address})`,
      );

      await db.execute(sql`
        update ${locations} as l
        set address = v.address
        from (values ${sql.join(values, sql`, `)}) as v(id, address)
        where l.id = v.id
      `);
    }
  }

  const dbParkings = await db
    .selectDistinctOn([parkings.location_id], {
      ...getTableColumns(parkings),
      latitude: locations.latitude,
      longitude: locations.longitude,
      address: locations.address,
    })
    .from(parkings)
    .leftJoin(locations, eq(parkings.location_id, locations.id))
    .where(eq(parkings.rep_description, "Réel"))
    .orderBy(parkings.location_id, desc(parkings.updatedAt));

  return dbParkings;
}
