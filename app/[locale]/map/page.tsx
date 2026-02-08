import { and, eq, getTableColumns, isNull, lt, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { ParkingMap } from "@/src/components/ParkingMap";
import { db } from "@/src/lib/db/drizzle";
import { APIParking, parkingAddresses, parkings } from "@/src/lib/db/schema";

async function fetchMontrealParking(): Promise<APIParking[]> {
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

async function fetchMapboxAddress(
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

const getCachedParkings = unstable_cache(
  async () => {
    const newParkings = await fetchMontrealParking();

    const normalized = newParkings.map((parking) => ({
      id: Number(parking._id),
      latitude: Number(parking.Latitude),
      longitude: Number(parking.Longitude),
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
    }));

    if (newParkings.length > 0) {
      await db
        .insert(parkings)
        .values(normalized)
        .onConflictDoUpdate({
          target: parkings.id,
          set: {
            latitude: sql`excluded.latitude`,
            longitude: sql`excluded.longitude`,
            rpa_code: sql`excluded.rpa_code`,
            rpa_description: sql`excluded.rpa_description`,
            rep_description: sql`excluded.rep_description`,
            rac_description: sql`excluded.rac_description`,
            cat_description: sql`excluded.cat_description`,
            post_id: sql`excluded.post_id`,
            post_version: sql`excluded.post_version`,
            post_conception_date: sql`excluded.post_conception_date`,
            sign_id: sql`excluded.sign_id`,
            sign_rpa_id: sql`excluded.sign_rpa_id`,
            borough: sql`excluded.borough`,
          },
        });

      const staleOrMissing = await db
        .select({
          parkingId: parkings.id,
          latitude: parkings.latitude,
          longitude: parkings.longitude,
        })
        .from(parkings)
        .leftJoin(
          parkingAddresses,
          eq(parkings.id, parkingAddresses.parking_id),
        )
        .where(
          and(
            eq(parkings.rep_description, "Réel"),
            or(
              isNull(parkingAddresses.id),
              isNull(parkingAddresses.address),
              lt(parkingAddresses.updatedAt, sql`now() - interval '48 hours'`),
            ),
          ),
        );

      for (const parking of staleOrMissing) {
        if (!parking.latitude || !parking.longitude) continue;

        const address = await fetchMapboxAddress(
          parking.latitude,
          parking.longitude,
        );

        await db
          .insert(parkingAddresses)
          .values({
            parking_id: parking.parkingId,
            address,
          })
          .onConflictDoUpdate({
            target: parkingAddresses.parking_id,
            set: { address: sql`excluded.address` },
          });
      }
    }

    const dbParkings = await db
      .select({
        ...getTableColumns(parkings),
        address: parkingAddresses.address,
      })
      .from(parkings)
      .leftJoin(parkingAddresses, eq(parkings.id, parkingAddresses.parking_id))
      .where(eq(parkings.rep_description, "Réel"));

    return dbParkings;
  },
  ["parkings"],
  { revalidate: 3600 },
);

export default async function MapPage() {
  const dbParkings = await getCachedParkings();

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-background">
      <ParkingMap parkings={dbParkings} />
    </div>
  );
}
