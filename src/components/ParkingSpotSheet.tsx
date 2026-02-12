"use client";

import {
  Apple,
  Construction,
  Locate,
  MapIcon,
  MapPin,
  Motorbike,
  Navigation,
} from "lucide-react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import styled, { css } from "styled-components";

import { CopyButton } from "@/src/components/CopyButton";
import { ParkingWithLocation } from "@/src/components/ParkingMap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { useStore } from "@/src/lib/zustand/store";

import "maplibre-gl/dist/maplibre-gl.css";

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

  const t = useTranslations();
  const {
    launchParkingSpotId,
    selectedParkingSpotId,
    setLaunchParkingSpotId,
    setSelectedParkingSpotId,
  } = useStore();

  const parkingUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("parkingId", String(parking.id));
    return url.toString();
  }, [parking]);

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
      <SheetContent side="bottom" className="flex px-8 pb-8 rounded-t-2xl">
        <SheetHeader className="pl-0 pb-0">
          <SheetTitle className="text-nowrap">
            <div className="flex items-center justify-between">
              {t("MapPage.motorcycleParking")}
              <CopyButton
                label={t("share")}
                item="parking_spot_link"
                content={parkingUrl}
              />
            </div>
          </SheetTitle>
        </SheetHeader>

        {parking.address && (
          <Item variant="muted" size="sm">
            <ItemMedia variant="icon">
              <MapPin />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{t("MapPage.address")}</ItemTitle>
              <ItemDescription>{parking.address}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <CopyButton
                item="parking_spot_address"
                content={parking.address}
              />
            </ItemActions>
          </Item>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            {t("MapPage.navigateWith")}
          </p>
          <div className="flex flex-1 gap-2">
            <Button
              variant="secondary"
              className="flex flex-1 flex-col p-10"
              onClick={() =>
                window.open(
                  `https://waze.com/ul?ll=${parking.latitude},${parking.longitude}&navigate=yes`,
                  "_blank",
                )
              }
            >
              <Navigation className="size-4" />
              Waze
            </Button>
            <Button
              variant="secondary"
              className="flex flex-1 flex-col p-10"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${parking.latitude},${parking.longitude}`,
                  "_blank",
                )
              }
            >
              <MapIcon className="size-4" />
              Google
            </Button>
            <Button
              variant="secondary"
              className="flex flex-1 flex-col p-10"
              onClick={() =>
                window.open(
                  `https://maps.apple.com/?daddr=${parking.latitude},${parking.longitude}`,
                  "_blank",
                )
              }
            >
              <Apple className="size-4" />
              Apple
            </Button>
          </div>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2 px-1">
              {t("MapPage.additionalDetails")}
            </AccordionTrigger>
            <AccordionContent>
              <Item variant="muted" size="sm">
                <ItemMedia variant="icon">
                  <Locate />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{t("MapPage.coordinates")}</ItemTitle>
                  <ItemDescription>
                    {parking.latitude}, {parking.longitude}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <CopyButton
                    item="parking_spot_address"
                    content={`${parking.latitude}, ${parking.longitude}`}
                  />
                </ItemActions>
              </Item>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="relative border-2 border-secondary p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="text-md font-bold text-primary">
                {t("MapPage.community.title")}
              </h3>
              <div className="flex gap-2">
                <span className="text-xs font-semibold px-2 py-1 bg-primary text-primary-foreground rounded-full text-nowrap">
                  {t("comingSoon")}
                </span>
                <Construction className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("MapPage.community.description")}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
