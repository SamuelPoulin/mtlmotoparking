"use client";

import {
  Apple,
  ExternalLink,
  MapIcon,
  Pin,
  Motorbike,
  Navigation,
} from "lucide-react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useRef, useState } from "react";
import {
  GeolocateControl,
  Map,
  Marker,
  type MapRef,
} from "react-map-gl/maplibre";

import { Button } from "@/src/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import useGeocode from "@/src/hooks/useGeocode";
import { Parking } from "@/src/lib/api/parkings";

import "maplibre-gl/dist/maplibre-gl.css";

type MarkerCoordinates = {
  latitude: number;
  longitude: number;
};

export default function MapClient({ parkings }: { parkings: Parking[] }) {
  const t = useTranslations("MapPage");
  const [searchOpen, setSearchOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchMarker, setSelectedSearchMarker] =
    useState<MarkerCoordinates | null>(null);

  const { results } = useGeocode({
    query: searchTerm,
    debounceTime: 600,
    limit: 3,
  });

  const onSelectAddress = ({ longitude, latitude }: MarkerCoordinates) => {
    setSearchOpen(false);
    setSearchTerm("");
    setSelectedSearchMarker({ latitude, longitude });

    mapRef.current?.flyTo({
      center: [longitude, latitude],
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-background">
      <div className="absolute flex justify-center w-screen z-10">
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
      </div>
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
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={result.place_id}
                  onSelect={() =>
                    onSelectAddress({
                      longitude: Number(result.lon),
                      latitude: Number(result.lat),
                    })
                  }
                >
                  {result.display_name.split(",").slice(0, 5).join(", ")}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
      <div className="flex-1 relative">
        <Map
          style={{ position: "absolute", width: "100%", height: "100%" }}
          ref={mapRef}
          initialViewState={{
            latitude: 45.5019,
            longitude: -73.5674,
            zoom: 14,
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          attributionControl={{
            compact: true,
            customAttribution:
              '<a href="https://donnees.montreal.ca">Ville de Montréal</a> | <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
          }}
        >
          <GeolocateControl position="bottom-right" />
          {parkings.map((parking) => (
            <Dialog key={parking._id}>
              <Marker
                key={parking._id}
                latitude={Number(parking.Latitude)}
                longitude={Number(parking.Longitude)}
                anchor="bottom"
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-md"
                    onClick={() => {
                      posthog.capture("parking_spot_opened", {
                        id: parking._id,
                      });
                    }}
                  >
                    <Motorbike className="h-4 w-4 text-foreground" />
                  </button>
                </DialogTrigger>
              </Marker>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("motorcycleParking")}</DialogTitle>
                  <DialogDescription>{parking.NOM_ARROND}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-col gap-2">
                  <p className="text-muted-foreground text-sm">
                    {t("navigateWith")}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    type="submit"
                    onClick={() =>
                      window.open(
                        `https://waze.com/ul?ll=${parking.Latitude},${parking.Longitude}&navigate=yes`,
                        "_blank",
                      )
                    }
                  >
                    <Navigation className="mr-2 size-4" />
                    Waze
                    <ExternalLink className="ml-auto size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    type="submit"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${parking.Latitude},${parking.Longitude}`,
                        "_blank",
                      )
                    }
                  >
                    <MapIcon className="mr-2 size-4" />
                    Google Maps
                    <ExternalLink className="ml-auto size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    type="submit"
                    onClick={() =>
                      window.open(
                        `https://maps.apple.com/?daddr=${parking.Latitude},${parking.Longitude}`,
                        "_blank",
                      )
                    }
                  >
                    <Apple className="mr-2 size-4" />
                    Apple Maps
                    <ExternalLink className="ml-auto size-4" />
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
          {selectedSearchMarker && (
            <Marker
              latitude={selectedSearchMarker.latitude}
              longitude={selectedSearchMarker.longitude}
              anchor="bottom"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-black shadow-md">
                <Pin />
              </div>
            </Marker>
          )}
        </Map>
      </div>
    </div>
  );
}
