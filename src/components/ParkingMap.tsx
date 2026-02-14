"use client";

import { Pin } from "lucide-react";
import { useTheme } from "next-themes";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  GeolocateControl,
  Map,
  Marker,
  type MapRef,
} from "react-map-gl/maplibre";

import { ParkingSpotSheet } from "@/src/components/ParkingSpotSheet";
import { SearchAddressButton } from "@/src/components/SearchAddressButton";
import { Parking } from "@/src/lib/db/schema";
import { useStore } from "@/src/lib/zustand/store";

import "maplibre-gl/dist/maplibre-gl.css";
import { useSearchParams } from "next/navigation";

export type MarkerCoordinates = {
  latitude: number;
  longitude: number;
};

export type ParkingWithLocation = Parking & {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  parkings: ParkingWithLocation[];
};

export function ParkingMap({ parkings }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const { setLaunchParkingSpotId } = useStore();

  const searchParkingId = Number(searchParams.get("parkingId"));

  const searchParking = useMemo(() => {
    if (!searchParkingId) return null;

    return parkings.find((p) => p.id === searchParkingId);
  }, [searchParkingId, parkings]);

  const { addressCoordinates } = useStore();
  useEffect(() => {
    if (
      !mapLoaded ||
      !searchParking ||
      !searchParking.latitude ||
      !searchParking.longitude
    ) {
      return;
    }

    posthog.capture("parking_spot_link_opened", {
      parking: searchParking,
    });

    mapRef.current?.flyTo({
      center: [searchParking.longitude, searchParking.latitude],
      zoom: 15,
      duration: 1000,
    });

    setLaunchParkingSpotId(searchParking.id);
  }, [setLaunchParkingSpotId, mapLoaded, searchParking]);

  return (
    <div className="flex-1">
      <div className="absolute flex justify-center w-screen z-10">
        <SearchAddressButton mapRef={mapRef} />
      </div>
      <Map
        style={{ height: "100%" }}
        ref={mapRef}
        initialViewState={{
          latitude: 45.5019,
          longitude: -73.5674,
          zoom: 14,
        }}
        mapStyle={
          resolvedTheme === "dark"
            ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        }
        attributionControl={{
          compact: true,
          customAttribution:
            '<a href="https://donnees.montreal.ca">Ville de Montréal</a> | <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
        }}
        onLoad={() => setMapLoaded(true)}
      >
        <GeolocateControl position="bottom-right" />
        {parkings.map((parking) => (
          <ParkingSpotSheet key={parking.id} parking={parking} />
        ))}
        {addressCoordinates && (
          <Marker
            latitude={addressCoordinates.latitude}
            longitude={addressCoordinates.longitude}
            anchor="bottom"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md  hover:bg-accent hover:text-accent-foreground">
              <Pin />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
