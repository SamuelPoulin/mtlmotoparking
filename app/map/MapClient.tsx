"use client";

import {
  Apple,
  ExternalLink,
  MapIcon,
  MapPin,
  Motorbike,
  Navigation,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  GeolocateControl,
  Map,
  Marker,
  type MapRef,
} from "react-map-gl/maplibre";
import posthog from "posthog-js";

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
import Link from "next/link";
import Image from "next/image";

import styles from "../page.module.css";
import MotorcycleScene from "@/src/components/three/MotorcycleScene";
import { PortfolioLink } from "@/src/components/social/PortfolioLink";
import { KofiLink } from "@/src/components/social/KofiLink";

export default function MapClient({ parkings }: { parkings: Parking[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchMarker, setSelectedSearchMarker] = useState<any>(null);

  const { results } = useGeocode({
    query: searchTerm,
    debounceTime: 600,
    limit: 3,
  });

  const onSelectAddress = ({ longitude, latitude }: any) => {
    setSearchOpen(false);
    setSearchTerm("");
    setSelectedSearchMarker({ latitude, longitude });

    mapRef.current?.flyTo({
      center: [longitude, latitude],
      duration: 2000,
    });
  };

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8">
              <MotorcycleScene />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              mtlmotoparking
            </span>
          </Link>
          <KofiLink />
        </div>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0">
        <div className="absolute flex justify-center w-screen z-10">
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              posthog.capture("search_address_opened");
              setSearchOpen(true);
            }}
          >
            Search an address
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
        <div className="flex-1 min-h-0">
          <Map
            style={{ width: "100%", height: "100%" }}
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
                <form>
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
                      <DialogTitle>Motorcycle Parking</DialogTitle>
                      <DialogDescription>
                        {parking.NOM_ARROND}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                      <p className="text-muted-foreground text-sm">
                        Navigate with:
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
                </form>
              </Dialog>
            ))}
            {selectedSearchMarker && (
              <Marker
                latitude={selectedSearchMarker.latitude}
                longitude={selectedSearchMarker.longitude}
                anchor="bottom"
              >
                <MapPin />
              </Marker>
            )}
          </Map>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
              <span>
                Made with <span className={styles.heartPulse}>💖</span> from
                Montréal
              </span>
            </div>
            <PortfolioLink />
          </div>
        </div>
      </footer>
    </div>
  );
}
