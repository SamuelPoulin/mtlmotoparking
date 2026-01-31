import { ParkingMap } from "@/src/components/ParkingMap";
import { db } from "@/src/lib/db/drizzle";
import { parkings } from "@/src/lib/db/schema";
import { sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

type APIParking = {
  _id: string;
  NOM_ARROND: string;
  CODE_RPA: string;
  DESCRIPTION_CAT: string;
  DESCRIPTION_REP: string;
  DESCRIPTION_RPA: string;
  POTEAU_ID_POT: string;
  Latitude: string;
  Longitude: string;
};

async function fetchMontrealParking(): Promise<APIParking[]> {
  const baseUrl = "https://donnees.montreal.ca/api/3/action/datastore_search";

  const params = new URLSearchParams({
    resource_id: "7f1d4ae9-1a12-46d7-953e-6b9c18c78680",
    filters: JSON.stringify({
      DESCRIPTION_REP: "Réel",
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
    console.log("Fetching...");
    const newParkings = await fetchMontrealParking();

    if (newParkings.length > 0) {
      await db
        .insert(parkings)
        .values(
          newParkings.map((parking) => ({
            id: Number(parking._id),
            latitude: Number(parking.Latitude),
            longitude: Number(parking.Longitude),
            rpa_code: parking.CODE_RPA,
            rep_description: parking.DESCRIPTION_REP,
            post_id: Number(parking.POTEAU_ID_POT),
            borough: parking.NOM_ARROND,
          })),
        )
        .onConflictDoUpdate({
          target: parkings.id,
          set: {
            latitude: sql`excluded.latitude`,
            longitude: sql`excluded.longitude`,
            rpa_code: sql`excluded.rpa_code`,
            rep_description: sql`excluded.rep_description`,
            post_id: sql`excluded.post_id`,
            borough: sql`excluded.borough`,
          },
        });
    }

    return await db.select().from(parkings);
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
