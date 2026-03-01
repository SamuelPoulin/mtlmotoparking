"use client";

import { Cog, LogOut, Map, Menu, Search, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useRef, useState, useTransition } from "react";

import { FeedbackLink } from "@/src/components/layout/FeedbackLink";
import { MadeWithLove } from "@/src/components/layout/MadeWithLove";
import { PortfolioLink } from "@/src/components/layout/PortfolioLink";
import { ThemeSwitcher } from "@/src/components/layout/ThemeSwitcher";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button, buttonVariants } from "@/src/components/ui/button";
import { DrawerTitle } from "@/src/components/ui/drawer";
import { Separator } from "@/src/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Spinner } from "@/src/components/ui/spinner";
import { LocaleSwitch } from "@/src/i18n/LocaleSwitch";
import { signOut, useSession } from "@/src/lib/auth-client";
import { useFavourites } from "@/src/lib/hooks/useFavourites";
import { useUserSettings } from "@/src/lib/hooks/useUserSettings";
import { useStore } from "@/src/lib/zustand/store";
import { cn } from "@/src/lib/utils";

const UserSkeleton = () => {
  return (
    <div className="flex flex-1 items-center p-5 gap-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
    </div>
  );
};

export function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const longPressActivationRef = useRef<NodeJS.Timeout | null>(null);
  const longPressActionRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const suppressClickRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [pressingFavouriteId, setPressingFavouriteId] = useState<number | null>(
    null,
  );

  const t = useTranslations();
  const tMenu = useTranslations("Menu");
  const tFavourites = useTranslations("Favourites");

  const [isNavigatingToSignIn, startSignInTransition] = useTransition();
  const { data: session, isPending: isSessionPending } = useSession();

  const { favourites, isLoading: isLoadingFavourites } = useFavourites();
  const { navigationApp } = useUserSettings();
  const { setFlyToParkingSpotId } = useStore();

  const handleSignout = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  const getNavigationUrl = (
    latitude: number,
    longitude: number,
    app: string,
  ): string => {
    switch (app) {
      case "waze":
        return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
      case "google":
        return `https://www.google.com/maps?q=${latitude},${longitude}`;
      case "apple":
        return `https://maps.apple.com/?daddr=${latitude},${longitude}`;
      default:
        return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
  };

  const flyToParkingSpot = (parkingId: number) => {
    if (!pathname.endsWith("/map")) {
      router.push("/map");
    }
    setFlyToParkingSpotId(parkingId);
    setOpen(false);
  };

  const openNavigationApp = (
    latitude: number | null,
    longitude: number | null,
  ) => {
    if (!latitude || !longitude || !navigationApp) return false;
    const navigationUrl = getNavigationUrl(latitude, longitude, navigationApp);
    window.open(navigationUrl, "_blank");
    setOpen(false);
    return true;
  };

  const clearLongPressTimers = () => {
    if (longPressActivationRef.current) {
      clearTimeout(longPressActivationRef.current);
      longPressActivationRef.current = null;
    }
    if (longPressActionRef.current) {
      clearTimeout(longPressActionRef.current);
      longPressActionRef.current = null;
    }
  };

  const handleLongPressStart = (
    event: React.PointerEvent,
    parkingId: number,
  ) => {
    clearLongPressTimers();

    activePointerIdRef.current = event.pointerId;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    longPressTriggeredRef.current = false;
    suppressClickRef.current = false;

    longPressActivationRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      suppressClickRef.current = true;
      setPressingFavouriteId(parkingId);
      longPressActionRef.current = setTimeout(() => {
        if (longPressTriggeredRef.current) {
          flyToParkingSpot(parkingId);
        }
      }, 500);
    }, 500);
  };

  const handleLongPressMove = (event: React.PointerEvent) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    if (!pointerStartRef.current) return;

    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > 10) {
      handleLongPressCancel();
    }
  };

  const handleLongPressEnd = (event: React.PointerEvent) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    clearLongPressTimers();

    if (longPressTriggeredRef.current) {
      event.preventDefault();
    }

    longPressTriggeredRef.current = false;
    pointerStartRef.current = null;
    activePointerIdRef.current = null;
    setPressingFavouriteId(null);
  };

  const handleLongPressCancel = () => {
    clearLongPressTimers();
    longPressTriggeredRef.current = false;
    pointerStartRef.current = null;
    activePointerIdRef.current = null;
    setPressingFavouriteId(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleLongPressCancel();
    }
    setOpen(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Toggle menu"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col [&>button:first-of-type]:hidden"
      >
        <SheetHeader className="flex justify-center p-5">
          <DrawerTitle className="text-xl">mtlmotoparking</DrawerTitle>
        </SheetHeader>
        <div className="flex items-center justify-between px-4">
          {isSessionPending && <UserSkeleton />}
          {!isSessionPending && !session && (
            <div className="flex flex-col items-center gap-3 w-full">
              <Button
                variant="outline"
                asChild
                className="w-full"
                onClick={() => startSignInTransition(() => setOpen(false))}
              >
                <Link href="/sign-in">
                  {isNavigatingToSignIn ? <Spinner /> : tMenu("signIn.button")}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center px-2">
                {tMenu("signIn.description")}
              </p>
            </div>
          )}
          {!isSessionPending && session && (
            <>
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarImage
                    src={session?.user.image ?? ""}
                    alt={session?.user.name}
                  />
                  <AvatarFallback>{session?.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="text-md">{session?.user.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-40 md:max-w-60">
                    {session?.user.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignout}
                aria-label="Toggle menu"
              >
                {isSigningOut ? <Spinner /> : <LogOut />}
              </Button>
            </>
          )}
        </div>
        <div className="flex px-4">
          <Separator />
        </div>
        <div className="flex flex-col px-4 gap-2">
          <Link
            href="/map"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "flex flex-1 justify-start font-medium text-md",
              pathname.endsWith("/map") &&
                "bg-accent text-accent-foreground dark:hover:bg-accent",
            )}
            onClick={() => setOpen(false)}
          >
            <Map />
            {t("MapPage.title")}
          </Link>
          {session && (
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "flex flex-1 justify-start font-medium text-md",
                pathname.endsWith("/settings") &&
                  "bg-accent text-accent-foreground dark:hover:bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              <Cog />
              {t("SettingsPage.title")}
            </Link>
          )}
        </div>
        <div className="flex px-4">
          <Separator />
        </div>
        <div className="flex flex-col w-full px-4 gap-2 flex-1 min-h-0">
          <div className="flex items-center gap-2">
            <div className="flex text-sm text-muted-foreground gap-1">
              {tFavourites("title")}
              {navigationApp && (
                <div className="flex items-center gap-1">
                  <div>-</div>
                  {tFavourites("holdHint")}
                  <Search className="size-4" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto min-h-0 flex-1">
            {session && isLoadingFavourites && (
              <div className="flex flex-col w-full gap-2 mt-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
              </div>
            )}
            {!session && (
              <p className="text-muted-foreground text-xs mt-2">
                {tFavourites("emptyLoggedOut")}
              </p>
            )}
            {session && !isLoadingFavourites && favourites.length === 0 && (
              <p className="text-muted-foreground text-xs mt-2">
                {tFavourites("empty")}
              </p>
            )}
            <div className="flex flex-col gap-2 w-full">
              {!isLoadingFavourites &&
                favourites.map((favourite) => (
                  <motion.div
                    key={favourite.parking_id}
                    className="w-full"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      className="relative flex justify-start w-full p-2 cursor-pointer select-none touch-manipulation overflow-hidden"
                      onClick={() => {
                        if (suppressClickRef.current) {
                          suppressClickRef.current = false;
                          return;
                        }
                        const didOpenNavigation = openNavigationApp(
                          favourite.latitude,
                          favourite.longitude,
                        );
                        if (!didOpenNavigation) {
                          flyToParkingSpot(favourite.parking_id);
                        }
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      onPointerDown={(event) =>
                        handleLongPressStart(event, favourite.parking_id)
                      }
                      onPointerMove={handleLongPressMove}
                      onPointerUp={handleLongPressEnd}
                      onPointerLeave={handleLongPressCancel}
                      onPointerCancel={handleLongPressCancel}
                    >
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 w-full bg-primary/60"
                        initial={{ x: "-100%" }}
                        animate={
                          pressingFavouriteId === favourite.parking_id
                            ? { x: ["-100%", "0%"] }
                            : { x: "-100%" }
                        }
                        transition={{ duration: 0.5, ease: "linear" }}
                      />
                      <Star className="size-5 text-yellow-400 fill-yellow-400 drop-shadow" />
                      <span className="font-semibold text-sm truncate">
                        {favourite.address ?? tFavourites("unknownAddress")}
                      </span>
                    </Button>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
        <SheetFooter className="pt-0 shrink-0">
          <Separator />
          <div className="flex flex-col items-center justify-center pt-1 pb-4 gap-4">
            <div className="flex gap-5">
              <ThemeSwitcher />
              <LocaleSwitch />
            </div>
            <div className="flex flex-col gap-4 items-center">
              <FeedbackLink />
              <MadeWithLove />
              <PortfolioLink />
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
