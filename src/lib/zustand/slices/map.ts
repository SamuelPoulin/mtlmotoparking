import { StateCreator } from "zustand";

import type { RootStore } from "@/src/lib/zustand/store";
import { MarkerCoordinates } from "@/src/components/ParkingMap";

export type MapSlice = {
  addressCoordinates: MarkerCoordinates | null;
  setAddressCoordinates: (addressCoordinates: MarkerCoordinates) => void;
};

export const createMapSlice: StateCreator<RootStore, [], [], MapSlice> = (
  set,
) => ({
  addressCoordinates: null,
  setAddressCoordinates: (addressCoordinates) => set({ addressCoordinates }),
});
