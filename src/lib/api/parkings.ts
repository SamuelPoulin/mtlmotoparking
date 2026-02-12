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

  if (uniqueLocations.length > 0) {
    await db.insert(locations).values(uniqueLocations).onConflictDoNothing();
  }

  let locationRows: { id: number; latitude: number; longitude: number }[] = [];
  if (uniqueLocations.length > 0) {
    const locationFilters = uniqueLocations.map((loc) =>
      and(
        eq(locations.latitude, loc.latitude),
        eq(locations.longitude, loc.longitude),
      ),
    );

    locationRows = await db
      .select({
        id: locations.id,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(locations)
      .where(or(...locationFilters));
  }

  const locationIdByKey = new Map(
    locationRows.map((row) => [`${row.latitude},${row.longitude}`, row.id]),
  );

  const normalizedParkings = newParkings.map((parking) => {
    const latitude = Number(parking.Latitude);
    const longitude = Number(parking.Longitude);
    const location_id = locationIdByKey.get(`${latitude},${longitude}`);

    return {
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
  });

  if (newParkings.length > 0) {
    await db.insert(parkings).values(normalizedParkings);

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

    for (const location of staleOrMissing) {
      if (!location.locationId || !location.latitude || !location.longitude)
        continue;

      const address = await fetchMapboxAddress(
        location.latitude,
        location.longitude,
      );

      await db
        .update(locations)
        .set({ address })
        .where(eq(locations.id, location.locationId));
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
