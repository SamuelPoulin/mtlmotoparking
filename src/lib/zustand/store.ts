import { create } from "zustand";

import { createMapSlice, MapSlice } from "@/src/lib/zustand/slices/map";

export type RootStore = MapSlice;

export const useStore = create<RootStore>()((...args) => ({
  ...createMapSlice(...args),
}));
