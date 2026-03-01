"use client";

import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/src/lib/auth-client";
import type { UserSettingsResponse } from "@/app/api/user/settings/route";

export function useUserSettings() {
  const { data: session, isPending: isSessionPending } = useSession();

  const query = useQuery<UserSettingsResponse>({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await fetch("/api/user/settings?offset=0");
      if (res.status === 401) return { navigationApp: null, contributions: [], total: 0 };
      if (!res.ok) throw new Error("Failed to fetch user settings");
      return res.json();
    },
    enabled: !!session && !isSessionPending,
    staleTime: 1000 * 60 * 5,
  });

  return {
    navigationApp: query.data?.navigationApp ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
