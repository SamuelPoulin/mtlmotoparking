import { StateCreator } from "zustand";

import type { RootStore } from "@/src/lib/zustand/store";

export type ParkingSheetSlice = {
  hasTransitioned: boolean;
  showContributeView: boolean;
  setHasTransitioned: (hasTransitioned: boolean) => void;
  setShowContributeView: (showContributeView: boolean) => void;
};

export const createParkingSheetSlice: StateCreator<
  RootStore,
  [],
  [],
  ParkingSheetSlice
> = (set) => ({
  hasTransitioned: false,
  showContributeView: false,
  setHasTransitioned: (hasTransitioned) => set({ hasTransitioned }),
  setShowContributeView: (showContributeView) => set({ showContributeView }),
});
