"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useSession } from "@/src/lib/auth-client";

export type Favourite = {
  parking_id: number;
  address: string | null;
};

type FavouritesResponse = {
  favourites: Favourite[];
};

type ToggleFavouriteInput = {
  parkingId: number;
  address?: string | null;
};

const MAX_FAVOURITES = 5;

export function useFavourites() {
  const t = useTranslations("Favourites");
  const { data: session, isPending: isSessionPending } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery<FavouritesResponse>({
    queryKey: ["favourites"],
    queryFn: async () => {
      const res = await fetch("/api/favourites");
      if (res.status === 401) return { favourites: [] };
      if (!res.ok) throw new Error("Failed to fetch favourites");
      return res.json();
    },
    enabled: !!session && !isSessionPending,
  });

  const favourites = useMemo(
    () => (session ? (query.data?.favourites ?? []) : []),
    [session, query.data?.favourites],
  );

  const favouriteIds = useMemo(
    () => new Set(favourites.map((favourite) => favourite.parking_id)),
    [favourites],
  );

  const mutation = useMutation({
    mutationFn: async (input: ToggleFavouriteInput) => {
      const isFavourite = favouriteIds.has(input.parkingId);

      if (isFavourite) {
        const res = await fetch(`/api/favourites/${input.parkingId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const error = await res.json().catch(() => null);
          const message = error?.error || "Failed to delete favourite";
          throw new Error(message);
        }

        return { action: "removed" as const };
      }

      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parking_id: input.parkingId }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        const message = error?.error || "Failed to add favourite";
        const err = new Error(message) as Error & { code?: string };
        err.code = error?.code;
        throw err;
      }

      return { action: "added" as const };
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["favourites"] });
      const previous = queryClient.getQueryData<FavouritesResponse>([
        "favourites",
      ]);

      const isFavourite = favouriteIds.has(input.parkingId);
      const previousFavourites = previous?.favourites ?? [];

      const updatedFavourites = isFavourite
        ? previousFavourites.filter(
            (favourite) => favourite.parking_id !== input.parkingId,
          )
        : [
            {
              parking_id: input.parkingId,
              address: input.address ?? null,
            },
            ...previousFavourites,
          ];

      queryClient.setQueryData<FavouritesResponse>(["favourites"], {
        favourites: updatedFavourites,
      });

      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favourites"], context.previous);
      }

      const errorCode = (error as Error & { code?: string }).code;
      if (errorCode === "limit_reached") {
        toast.error(t("limitReached"));
        return;
      }

      toast.error(t("updateError"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    },
  });

  const toggleFavourite = (input: ToggleFavouriteInput) => {
    if (!session || isSessionPending) return;

    const isFavourite = favouriteIds.has(input.parkingId);
    if (!isFavourite && favourites.length >= MAX_FAVOURITES) {
      toast.error(t("limitReached"));
      return;
    }

    mutation.mutate(input);
  };

  const isFavourite = (parkingId: number) => favouriteIds.has(parkingId);

  return {
    favourites,
    isLoading: query.isLoading,
    isError: query.isError,
    isFavourite,
    isToggling: mutation.isPending,
    toggleFavourite,
  };
}
