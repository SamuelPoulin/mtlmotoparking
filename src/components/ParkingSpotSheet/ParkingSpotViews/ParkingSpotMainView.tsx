"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera, Construction, Locate, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { FaApple, FaGoogle, FaWaze } from "react-icons/fa";
import Image from "next/image";

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
import { useSession } from "@/src/lib/auth-client";
import { useStore } from "@/src/lib/zustand/store";
import type { ContributionWithUser } from "@/src/lib/api/contributions";

import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  parking: ParkingWithLocation;
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

function ContributionCard({
  contribution,
  labels,
}: {
  contribution: ContributionWithUser;
  labels: ReturnType<typeof useTranslations<"MapPage.community">>;
}) {
  const fullnessColor = (() => {
    if (contribution.fullness <= 20)
      return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (contribution.fullness <= 40)
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
    if (contribution.fullness <= 60)
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    if (contribution.fullness <= 80)
      return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  })();

  const fullnessLabel = (() => {
    if (contribution.fullness <= 20) return labels("empty");
    if (contribution.fullness <= 40) return labels("quiet");
    if (contribution.fullness <= 60) return labels("moderate");
    if (contribution.fullness <= 80) return labels("busy");
    return labels("full");
  })();

  return (
    <div className="flex flex-col gap-3 p-3 bg-card border border-border rounded-lg">
      <div className="relative w-full h-32 rounded-md overflow-hidden">
        <Image
          src={contribution.cloudinary_url}
          alt="Parking spot photo"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {contribution.user?.image ? (
            <Image
              src={contribution.user.image}
              alt={contribution.user.name || "User"}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted" />
          )}
          <span className="text-sm font-medium">
            {contribution.user?.name || "Anonymous"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(contribution.createdAt)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${fullnessColor}`}>
          {fullnessLabel}
        </span>
      </div>
      {contribution.description && (
        <p className="text-sm text-muted-foreground">
          {contribution.description}
        </p>
      )}
    </div>
  );
}

function ContributionSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3 bg-card border border-border rounded-lg">
      <Skeleton className="w-full h-32 rounded-md" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-20 h-4" />
        </div>
        <Skeleton className="w-12 h-3" />
      </div>
      <Skeleton className="w-16 h-5 rounded-full" />
    </div>
  );
}

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
