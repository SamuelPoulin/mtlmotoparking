import { StateCreator } from "zustand";

import type { RootStore } from "@/src/lib/zustand/store";
import { MarkerCoordinates } from "@/src/components/ParkingMap";

export type Parking = {
  _id: string;
  NOM_ARROND: string;
  CODE_RPA: string;
  DESCRIPTION_CAT: string;
  DESCRIPTION_RPA: string;
  Latitude: string;
  Longitude: string;
};

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
