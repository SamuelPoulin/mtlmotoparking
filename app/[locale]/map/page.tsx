import { eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { ParkingMap } from "@/src/components/ParkingMap";
import { db } from "@/src/lib/db/drizzle";
import { APIParking, parkings } from "@/src/lib/db/schema";

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
    }

    const dbParkings = await db
      .select()
      .from(parkings)
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
