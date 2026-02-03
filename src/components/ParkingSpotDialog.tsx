"use client";

import {
  Apple,
  ExternalLink,
  MapIcon,
  Motorbike,
  Navigation,
} from "lucide-react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { Marker } from "react-map-gl/maplibre";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Parking } from "@/src/lib/db/schema";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  parking: Parking;
};

export function ParkingSpotDialog({ parking }: Props) {
  const search = useSearchParams();
  const router = useRouter();
  const t = useTranslations("MapPage");

  const selectedParkingId = Number(search.get("parkingId"));

  const removeParkingIdParam = () => {
    const params = new URLSearchParams(search.toString());
    params.delete("parkingId");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const setParkingIdParam = () => {
    const params = new URLSearchParams(search.toString());
    params.append("parkingId", String(parking.id));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Dialog
      key={parking.id}
      open={selectedParkingId === parking.id}
      onOpenChange={removeParkingIdParam}
    >
      <Marker
        key={parking.id}
        latitude={Number(parking.latitude)}
        longitude={Number(parking.longitude)}
        anchor="bottom"
      >
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            posthog.capture("parking_spot_opened", {
              id: parking.id,
            });

            setParkingIdParam();
          }}
        >
          <Motorbike className="h-4 w-4 text-foreground" />
        </button>
      </Marker>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("motorcycleParking")}</DialogTitle>
          <DialogDescription>{parking.borough}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <p className="text-muted-foreground text-sm">{t("navigateWith")}</p>
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
  );
}
