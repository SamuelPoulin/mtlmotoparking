"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera, Construction, Locate, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { FaApple, FaGoogle, FaWaze } from "react-icons/fa";

import { CopyButton } from "@/src/components/CopyButton";
import { ParkingWithLocation } from "@/src/components/ParkingMap";
import {
  ContributionCard,
  ContributionSkeleton,
} from "@/src/components/ParkingSpotSheet/ContributionCard";
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
import { Separator } from "@/src/components/ui/separator";
import { SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
import type { ContributionWithUser } from "@/src/lib/api/contributions";
import { useSession } from "@/src/lib/auth-client";
import { useStore } from "@/src/lib/zustand/store";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  parking: ParkingWithLocation;
};

export function ParkingSpotMainView({ parking }: Props) {
  const t = useTranslations();
  const tCommunity = useTranslations("MapPage.community");
  const { hasTransitioned, setShowContributeView, setHasTransitioned } =
    useStore();
  const { data: session } = useSession();

  const { data: contributionsData, isLoading } = useQuery<{
    contributions: ContributionWithUser[];
  }>({
    queryKey: ["contributions", parking.id],
    queryFn: async () => {
      const res = await fetch(`/api/contributions?parking_id=${parking.id}`);
      if (!res.ok) throw new Error("Failed to fetch contributions");
      return res.json();
    },
  });

  const contributions = contributionsData?.contributions ?? [];

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

      <Separator />

      <div className="relative flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-bold text-primary">
            {t("MapPage.community.title")}
          </h3>
          <div className="flex gap-2">
            <Button
              disabled={!session}
              onClick={() => {
                setHasTransitioned(true);
                setShowContributeView(true);
              }}
            >
              {t("MapPage.community.contribute")}
              <Camera />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {!session && t("MapPage.community.signInDescription")}
          {session && t("MapPage.community.description")}
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <ContributionSkeleton />
          </div>
        ) : contributions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {contributions.map((contribution) => (
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
                labels={tCommunity}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 p-4 text-sm justify-center bg-card border border-border w-full rounded-lg">
            <div className="flex items-center">
              <div className="bg-muted p-4 flex justify-center rounded-full">
                <Construction className="animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-md">
                {t("MapPage.community.emptyCommunity.title")}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("MapPage.community.emptyCommunity.description")}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
