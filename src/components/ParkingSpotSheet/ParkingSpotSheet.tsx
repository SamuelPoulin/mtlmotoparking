"use client";

import { Motorbike } from "lucide-react";
import { AnimatePresence } from "motion/react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import styled, { css } from "styled-components";

import { ParkingWithLocation } from "@/src/components/ParkingMap";
import { ParkingSpotMainView } from "@/src/components/ParkingSpotSheet/ParkingSpotViews/ParkingSpotMainView";
import { Sheet, SheetContent } from "@/src/components/ui/sheet";
import { useStore } from "@/src/lib/zustand/store";
import { ParkingSpotContributeView } from "@/src/components/ParkingSpotSheet/ParkingSpotViews/ParkingSpotContributeView";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";

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
  parking: ParkingWithLocation;
};

export function ParkingSpotSheet({ parking }: Props) {
  const [delayedOpen, setDelayedOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { showContributeView, setShowContributeView, setHasTransitioned } =
    useStore();

  const {
    launchParkingSpotId,
    selectedParkingSpotId,
    setLaunchParkingSpotId,
    setSelectedParkingSpotId,
  } = useStore();

  const handleClose = () => {
    setSelectedParkingSpotId(null);
    setDelayedOpen(false);
    setShowContributeView(false);
    setHasTransitioned(false);
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
    <Sheet key={parking.id} open={open} onOpenChange={handleClose}>
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
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="flex flex-col px-8 pb-8 rounded-t-2xl max-h-[75vh] md:max-h-none md:rounded-t-none overflow-hidden overflow-y-auto"
      >
        <div className="flex flex-col w-full">
          <AnimatePresence mode="wait">
            {showContributeView ? (
              <ParkingSpotContributeView parkingId={parking.id} />
            ) : (
              <ParkingSpotMainView parking={parking} />
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
