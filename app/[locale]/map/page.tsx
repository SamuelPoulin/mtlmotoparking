import { fetchMontrealParking } from "@/src/lib/api/parkings";
import MapClient from "./MapClient";

export default async function MapPage() {
  const parkings = await fetchMontrealParking();

  return <MapClient parkings={parkings} />;
}
