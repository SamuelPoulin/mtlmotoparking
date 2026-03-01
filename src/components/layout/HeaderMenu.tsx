"use client";

import { Cog, LogOut, Map, Menu, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

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

  const handleLongPressStart = (
    e: React.TouchEvent | React.MouseEvent,
    latitude: number | null,
    longitude: number | null,
  ) => {
    if (!latitude || !longitude || !navigationApp) return;

    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      e.preventDefault();
      window.open(
        getNavigationUrl(latitude, longitude, navigationApp),
        "_blank",
      );
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
            <span className="text-sm text-muted-foreground">
              {tFavourites("title")}
              {navigationApp && ` - ${tFavourites("holdHint")}`}
            </span>
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
                  <Button
                    key={favourite.parking_id}
                    variant="ghost"
                    className="flex justify-start w-full p-2 cursor-pointer select-none touch-manipulation"
                    onClick={() => {
                      if (longPressTriggeredRef.current) {
                        longPressTriggeredRef.current = false;
                        return;
                      }
                      if (!pathname.endsWith("/map")) {
                        router.push("/map");
                      }
                      setFlyToParkingSpotId(favourite.parking_id);
                      setOpen(false);
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) =>
                      handleLongPressStart(
                        e,
                        favourite.latitude,
                        favourite.longitude,
                      )
                    }
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={(e) =>
                      handleLongPressStart(
                        e,
                        favourite.latitude,
                        favourite.longitude,
                      )
                    }
                    onTouchEnd={handleLongPressEnd}
                  >
                    <Star className="size-5 text-yellow-400 fill-yellow-400 drop-shadow" />
                    <span className="font-semibold text-sm truncate">
                      {favourite.address ?? tFavourites("unknownAddress")}
                    </span>
                  </Button>
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
