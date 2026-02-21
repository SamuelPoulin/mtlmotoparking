"use client";

import { Camera, Locate, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { FaApple, FaGoogle, FaWaze } from "react-icons/fa";

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
import { SheetHeader, SheetTitle } from "@/src/components/ui/sheet";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  parking: ParkingWithLocation;
  hasTransitioned: boolean;
  setHasTransitionedAction: (hasTransitioned: boolean) => void;
  setShowContributeViewAction: (showContributeView: boolean) => void;
};

export function ParkingSpotMainView({
  parking,
  hasTransitioned,
  setHasTransitionedAction: setHasTransitionedAction,
  setShowContributeViewAction: setShowUpdateView,
}: Props) {
  const t = useTranslations();

  const parkingUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("parkingId", String(parking.id));
    return url.toString();
  }, [parking]);

  return (
    <motion.div
      key="main-view"
      initial={
        !hasTransitioned ? { x: 0, opacity: 1 } : { x: "-100%", opacity: 0 }
      }
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col w-full gap-4"
    >
      <SheetHeader className="pl-0">
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
            <CopyButton item="parking_spot_address" content={parking.address} />
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
            <FaWaze className="size-4" />
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
            <FaGoogle className="size-4" />
            Google Maps
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
            <FaApple className="size-4" />
            Apple Maps
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

      <div className="flex flex-col gap-4 relative border-2 border-secondary p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-bold text-primary">
            {t("MapPage.community.title")}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setHasTransitionedAction(true);
                setShowUpdateView(true);
              }}
            >
              {t("MapPage.community.update")}
              <Camera />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("MapPage.community.description")}
        </p>
      </div>
    </motion.div>
  );
}
