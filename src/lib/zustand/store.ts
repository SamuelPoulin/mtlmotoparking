import { create } from "zustand";

import { createMapSlice, MapSlice } from "@/src/lib/zustand/slices/map";
import {
  createParkingSheetSlice,
  ParkingSheetSlice,
} from "@/src/lib/zustand/slices/parking-sheet";

export type RootStore = MapSlice & ParkingSheetSlice;

export const useStore = create<RootStore>()((...args) => ({
  ...createMapSlice(...args),
  ...createParkingSheetSlice(...args),
}));
