import { StateCreator } from "zustand";

import type { RootStore } from "@/src/lib/zustand/store";
import { MarkerCoordinates } from "@/src/components/ParkingMap";

export type MapSlice = {
  selectedCoordinates: MarkerCoordinates | null;
  setSelectedCoordinates: (selectedCoordinates: MarkerCoordinates) => void;
};

export const createMapSlice: StateCreator<RootStore, [], [], MapSlice> = (
  set,
) => ({
  selectedCoordinates: null,
  setSelectedCoordinates: (selectedCoordinates) => set({ selectedCoordinates }),
});
