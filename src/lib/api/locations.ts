import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import pLimit from "p-limit";

import { db } from "@/src/lib/db/drizzle";
import { APIParking, locations, parkings } from "@/src/lib/db/schema";

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

export const locationKey = (latitude: number, longitude: number) =>
  `${latitude},${longitude}`;

export async function upsertAndFetchLocationIds(newParkings: APIParking[]) {
  const uniqueLocationsMap = new Map();

  for (const parking of newParkings) {
    const latitude = Number(parking.Latitude);
    const longitude = Number(parking.Longitude);
    uniqueLocationsMap.set(locationKey(latitude, longitude), {
      latitude,
      longitude,
    });
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

  return new Map(
    locationRows.map((row) => [
      locationKey(row.latitude, row.longitude),
      row.id,
    ]),
  );
}

export async function updateStaleOrMissingAddresses() {
  const staleOrMissing = await db
    .select({
      locationId: locations.id,
      latitude: locations.latitude,
      longitude: locations.longitude,
    })
    .from(parkings)
    .innerJoin(locations, eq(parkings.location_id, locations.id))
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

  const limit = pLimit(MAPBOX_CONCURRENCY);

  await Promise.all(
    addressTargets.map((loc) =>
      limit(async () => {
        const address = await fetchMapboxAddress(loc.latitude!, loc.longitude!);
        addressUpdates.push({ id: loc.locationId!, address });
      }),
    ),
  );

  if (addressUpdates.length > 0) {
    const values = addressUpdates.map(
      ({ id, address }) => sql`(${id}::int, ${address})`,
    );

    await db.execute(sql`
          update ${locations} as l
          set address = v.address,
                updated_at = now()
          from (values ${sql.join(values, sql`, `)}) as v(id, address)
          where l.id = v.id
        `);
  }
}
