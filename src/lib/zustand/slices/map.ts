import { StateCreator } from "zustand";

import type { RootStore } from "@/src/lib/zustand/store";
import { MarkerCoordinates } from "@/src/components/ParkingMap";

export type MapSlice = {
  addressCoordinates: MarkerCoordinates | null;
  selectedParkingSpotId: number | null;
  launchParkingSpotId: number | null;
  flyToParkingSpotId: number | null;
  setAddressCoordinates: (addressCoordinates: MarkerCoordinates) => void;
  setSelectedParkingSpotId: (selectedParkingSpotId: number | null) => void;
  setLaunchParkingSpotId: (launchParkingSpotId: number | null) => void;
  setFlyToParkingSpotId: (flyToParkingSpotId: number | null) => void;
};

export const createMapSlice: StateCreator<RootStore, [], [], MapSlice> = (
  set,
) => ({
  addressCoordinates: null,
  selectedParkingSpotId: null,
  launchParkingSpotId: null,
  flyToParkingSpotId: null,
  setAddressCoordinates: (addressCoordinates) => set({ addressCoordinates }),
  setSelectedParkingSpotId: (selectedParkingSpotId) =>
    set({ selectedParkingSpotId }),
  setLaunchParkingSpotId: (launchParkingSpotId) => set({ launchParkingSpotId }),
  setFlyToParkingSpotId: (flyToParkingSpotId) =>
    set({ flyToParkingSpotId }),
});
