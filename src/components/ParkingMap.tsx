"use client";

import {
  Apple,
  ExternalLink,
  MapIcon,
  Motorbike,
  Navigation,
  Pin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useRef } from "react";
import {
  GeolocateControl,
  Map,
  Marker,
  type MapRef,
} from "react-map-gl/maplibre";

import { SearchAddressButton } from "@/src/components/SearchAddressButton";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { useStore } from "@/src/lib/zustand/store";
import { Parking } from "@/src/lib/db/schema";

import "maplibre-gl/dist/maplibre-gl.css";

export type MarkerCoordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  parkings: Parking[];
};

export function ParkingMap({ parkings }: Props) {
  const t = useTranslations("MapPage");
  const mapRef = useRef<MapRef>(null);

  const { selectedCoordinates } = useStore();

  return (
    <div className="flex-1 relative">
      <div className="absolute flex justify-center w-screen z-10">
        <SearchAddressButton mapRef={mapRef} />
      </div>
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
          <Dialog key={parking.id}>
            <Marker
              key={parking.id}
              latitude={Number(parking.latitude)}
              longitude={Number(parking.longitude)}
              anchor="bottom"
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-md"
                  onClick={() => {
                    posthog.capture("parking_spot_opened", {
                      id: parking.id,
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
                <DialogDescription>{parking.borough}</DialogDescription>
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
                      `https://waze.com/ul?ll=${parking.latitude},${parking.longitude}&navigate=yes`,
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
                      `https://www.google.com/maps?q=${parking.latitude},${parking.longitude}`,
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
                      `https://maps.apple.com/?daddr=${parking.latitude},${parking.longitude}`,
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
        {selectedCoordinates && (
          <Marker
            latitude={selectedCoordinates.latitude}
            longitude={selectedCoordinates.longitude}
            anchor="bottom"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-black shadow-md">
              <Pin />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
