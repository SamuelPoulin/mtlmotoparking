import { desc, eq, getTableColumns, sql } from "drizzle-orm";

import { locationKey } from "@/src/lib/api/locations";
import { db } from "@/src/lib/db/drizzle";
import { APIParking, locations, Parking, parkings } from "@/src/lib/db/schema";

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

export function normalizeAndDedupeParkings(
  newParkings: APIParking[],
  locationIdByKey: Map<string, number>,
) {
  const processedParkings = new Map();

  for (const parking of newParkings) {
    const latitude = Number(parking.Latitude);
    const longitude = Number(parking.Longitude);
    const location_id = locationIdByKey.get(locationKey(latitude, longitude));

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

  return Array.from(processedParkings.values());
}

export async function upsertParkings(finalParkings: Parking[]) {
  if (finalParkings.length === 0) return;
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
}

export async function queryFinalParkings() {
  return db
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
}
