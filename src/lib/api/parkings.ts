export type Parking = {
  _id: string;
  NOM_ARROND: string;
  CODE_RPA: string;
  DESCRIPTION_CAT: string;
  DESCRIPTION_RPA: string;
  Latitude: string;
  Longitude: string;
};

export async function fetchMontrealParking(): Promise<Parking[]> {
  const baseUrl =
    "https://donnees.montreal.ca/api/3/action/datastore_search_sql";
  const params = new URLSearchParams({
    sql: `SELECT * from "7f1d4ae9-1a12-46d7-953e-6b9c18c78680" WHERE "DESCRIPTION_REP" = 'Réel' AND "CODE_RPA" in ('R-MO', 'R-MT', 'R-TN', 'OUT-SDX-12')`,
  });

  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch parking data: ${response.status}`);
  }

  const data: {
    result: { records: Parking[] };
  } = await response.json();

  return data.result.records;
}
