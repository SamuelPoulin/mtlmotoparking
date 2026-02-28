"use client";

import { Cog, LogOut, Map, Menu, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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

  const t = useTranslations();
  const tMenu = useTranslations("Menu");
  const tFavourites = useTranslations("Favourites");

  const [isNavigatingToSignIn, startSignInTransition] = useTransition();
  const { data: session, isPending: isSessionPending } = useSession();

  const { favourites, isLoading: isLoadingFavourites } = useFavourites();

  const handleSignout = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
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
        className="flex [&>button:first-of-type]:hidden"
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
        <div className="flex flex-col w-full pl-8 pr-4 gap-2">
          <span className="text-sm text-muted-foreground">
            {tFavourites("title")}
          </span>
          <div className="flex flex-col w-full justify-start items-start gap-1">
            {session && isLoadingFavourites && (
              <div className="flex flex-col w-full gap-2 mt-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
              </div>
            )}
            {!isLoadingFavourites && favourites.length === 0 && (
              <p className="text-muted-foreground text-xs mt-2">
                {tFavourites("empty")}
              </p>
            )}
            {!isLoadingFavourites &&
              favourites.map((favourite) => (
                <Button
                  key={favourite.parking_id}
                  variant="ghost"
                  className="flex justify-start w-full p-2 cursor-pointer"
                  onClick={() => {
                    router.push(`/map?parkingId=${favourite.parking_id}`);
                    setOpen(false);
                  }}
                >
                  <Star className="size-5 text-yellow-400 fill-yellow-400 drop-shadow" />
                  <span className="font-semibold text-sm truncate">
                    {favourite.address ?? tFavourites("unknownAddress")}
                  </span>
                </Button>
              ))}
          </div>
        </div>
        <SheetFooter>
          <Separator />
          <div className="flex flex-col items-center justify-center pb-8 pt-2 gap-6">
            <ThemeSwitcher />
            <LocaleSwitch />
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
