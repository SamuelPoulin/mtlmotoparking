"use client";

import {
  Apple,
  Copy,
  CopyCheck,
  ExternalLink,
  MapIcon,
  Motorbike,
  Navigation,
} from "lucide-react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
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
import { useStore } from "@/src/lib/zustand/store";

import "maplibre-gl/dist/maplibre-gl.css";
import styled, { css } from "styled-components";

const PulsateMarkerButton = styled.button<{ $pulsate: boolean }>`
  position: relative;
  overflow: visible;

  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background-color: #3b82f6;
    opacity: 0;
    z-index: -1;
    pointer-events: none;
  }

  ${({ $pulsate }) =>
    $pulsate &&
    css`
      &::before {
        animation: ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
      &::after {
        animation: ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        animation-delay: 0.6s;
      }
    `}
`;

type Props = {
  parking: Parking;
};

export function ParkingSpotDialog({ parking }: Props) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [delayedOpen, setDelayedOpen] = useState(false);

  const t = useTranslations("MapPage");
  const {
    launchParkingSpotId,
    selectedParkingSpotId,
    setLaunchParkingSpotId,
    setSelectedParkingSpotId,
  } = useStore();

  const handleCopy = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("parkingId", String(parking.id));
    await navigator.clipboard.writeText(url.toString());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  const handleClose = () => {
    setSelectedParkingSpotId(null);
    setDelayedOpen(false);
  };

  useEffect(() => {
    if (!launchParkingSpotId || launchParkingSpotId !== parking.id) return;

    const timeoutId = setTimeout(() => {
      setDelayedOpen(true);
      setLaunchParkingSpotId(null);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [setDelayedOpen, setLaunchParkingSpotId, launchParkingSpotId, parking]);

  const open = delayedOpen || selectedParkingSpotId === parking.id;

  return (
    <Dialog key={parking.id} open={open} onOpenChange={handleClose}>
      <Marker
        key={parking.id}
        latitude={Number(parking.latitude)}
        longitude={Number(parking.longitude)}
        anchor="bottom"
      >
        <PulsateMarkerButton
          $pulsate={launchParkingSpotId === parking.id}
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            posthog.capture("parking_spot_opened", {
              id: parking.id,
            });

            setSelectedParkingSpotId(parking.id);
          }}
        >
          <Motorbike className="h-4 w-4 text-foreground" />
        </PulsateMarkerButton>
      </Marker>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-nowrap">
            <div className="flex items-center justify-between pr-6">
              {t("motorcycleParking")}
              <Button variant="ghost" onClick={handleCopy}>
                {linkCopied ? t("copied") : t("share")}{" "}
                {linkCopied ? <CopyCheck /> : <Copy />}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="text-left">
            {parking.borough}
          </DialogDescription>
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
