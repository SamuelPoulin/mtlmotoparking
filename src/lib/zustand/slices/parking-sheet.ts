import { StateCreator } from "zustand";

import type { RootStore } from "@/src/lib/zustand/store";

export type ParkingSpotData = {
  photoUrl: string | null;
  fullness: number;
  description: string;
};

export type ParkingSheetSlice = {
  hasTransitioned: boolean;
  showContributeView: boolean;
  isSubmitting: boolean;
  setHasTransitioned: (hasTransitioned: boolean) => void;
  setShowContributeView: (showContributeView: boolean) => void;
  submitParkingSpotUpdate: (data: ParkingSpotData) => void;
};

export const createParkingSheetSlice: StateCreator<
  RootStore,
  [],
  [],
  ParkingSheetSlice
> = (set) => ({
  hasTransitioned: false,
  showContributeView: false,
  isSubmitting: false,
  setHasTransitioned: (hasTransitioned) => set({ hasTransitioned }),
  setShowContributeView: (showContributeView) => set({ showContributeView }),
  submitParkingSpotUpdate: (data) => {
    console.log({ data });

    set({ isSubmitting: true });

    setTimeout(() => {
      set({ isSubmitting: false });
      set({ showContributeView: false });
    }, 1000);
  },
});
