"use client";

import {
  SearchBoxCore,
  SearchBoxSuggestion,
  SearchSession,
} from "@mapbox/search-js-core";
import { useQuery } from "@tanstack/react-query";
import { CommandLoading } from "cmdk";
import debounce from "lodash.debounce";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { RefObject, useEffect, useMemo, useState } from "react";
import { type MapRef } from "react-map-gl/maplibre";

import { Button } from "@/src/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { Spinner } from "@/src/components/ui/spinner";
import { useStore } from "@/src/lib/zustand/store";

type Props = {
  mapRef: RefObject<MapRef | null>;
};

export function SearchAddressButton({ mapRef }: Props) {
  const t = useTranslations("MapPage");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  const { setSelectedCoordinates } = useStore();
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const searchBoxCore = useMemo(
    () =>
      new SearchBoxCore({
        accessToken,
        bbox: [
          [-74.028625, 45.393628],
          [-73.423004, 45.71481],
        ],
      }),
    [accessToken],
  );

  const session = useMemo(
    () => new SearchSession(searchBoxCore),
    [searchBoxCore],
  );

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["suggest", debouncedTerm],
    enabled: debouncedTerm.trim().length > 0,
    queryFn: async () => {
      console.log("Fetching...");
      const { suggestions } = await searchBoxCore.suggest(debouncedTerm, {
        sessionToken: session.sessionToken,
      });

      return suggestions;
    },
  });

  const debouncedSetTerm = debounce(
    (value: string) => setDebouncedTerm(value),
    300,
  );

  useEffect(() => {
    debouncedSetTerm(searchTerm);

    return () => {
      debouncedSetTerm.cancel();
    };
  }, [searchTerm, debouncedSetTerm]);

  const handleSelected = async (suggestion: SearchBoxSuggestion) => {
    const res = await searchBoxCore.retrieve(suggestion, {
      sessionToken: session.sessionToken,
    });

    setSearchOpen(false);
    setSearchTerm("");

    const [lng, lat] = res.features[0].geometry.coordinates;

    setSelectedCoordinates({ latitude: lat, longitude: lng });
    mapRef?.current?.flyTo({
      center: [lng, lat],
      duration: 2000,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        className="mt-5"
        onClick={() => {
          posthog.capture("search_address_opened");
          setSearchOpen(true);
        }}
      >
        {t("searchAnAddress")}
      </Button>
      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        className="top-40/100"
      >
        <CommandInput
          placeholder="Search an address..."
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {!isFetching && <CommandEmpty>No results found.</CommandEmpty>}
          {isFetching && (
            <CommandLoading className="flex flex-1 items-center justify-center py-4">
              <Spinner className="size-8" />
            </CommandLoading>
          )}
          {suggestions.length > 0 && (
            <CommandGroup heading="Results">
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.mapbox_id}
                  onSelect={() => handleSelected(suggestion)}
                >
                  {suggestion.full_address}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
