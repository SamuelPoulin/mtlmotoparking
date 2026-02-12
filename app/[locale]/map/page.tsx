import { unstable_cache } from "next/cache";

import { ParkingMap } from "@/src/components/ParkingMap";
import { getParkings } from "@/src/lib/api/parkings";

const getCachedParkings = unstable_cache(getParkings, ["parkings"], {
  // Every 12 hours
  revalidate: 60 * 60 * 12,
});

export default async function MapPage() {
  const dbParkings = await getCachedParkings();

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-background">
      <ParkingMap parkings={dbParkings} />
    </div>
  );
}
