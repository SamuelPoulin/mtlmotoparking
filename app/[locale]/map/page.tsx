import { ParkingMap } from "@/src/components/ParkingMap";
import { Parking } from "@/src/lib/zustand/slices/map";

export async function fetchMontrealParking(): Promise<Parking[]> {
  const baseUrl = "https://donnees.montreal.ca/api/3/action/datastore_search";

  const params = new URLSearchParams({
    resource_id: "7f1d4ae9-1a12-46d7-953e-6b9c18c78680",
    filters: JSON.stringify({
      DESCRIPTION_REP: "Réel",
      CODE_RPA: ["R-MO", "R-MT", "R-TN", "OUT-SDX-12"],
    }),
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

export default async function MapPage() {
  const parkings = await fetchMontrealParking();

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-background">
      <ParkingMap parkings={parkings} />
    </div>
  );
}
