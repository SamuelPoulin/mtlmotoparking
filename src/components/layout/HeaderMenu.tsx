"use client";

import { Cog, LogOut, Map, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { FeedbackLink } from "@/src/components/layout/FeedbackLink";
import { MadeWithLove } from "@/src/components/layout/MadeWithLove";
import { PortfolioLink } from "@/src/components/layout/PortfolioLink";
import { ThemeSwitcher } from "@/src/components/layout/ThemeSwitcher";
import { Button, buttonVariants } from "@/src/components/ui/button";
import { DrawerTitle } from "@/src/components/ui/drawer";
import { LocaleSwitch } from "@/src/i18n/LocaleSwitch";
import { signOut, useSession } from "@/src/lib/auth-client";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
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

  const t = useTranslations("Menu");
  const [isNavigatingToSignIn, startSignInTransition] = useTransition();
  const { data: session, isPending: isSessionPending } = useSession();

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
                  {isNavigatingToSignIn ? <Spinner /> : t("signIn.button")}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center px-2">
                {t("signIn.description")}
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
              pathname.endsWith("/map") && "bg-accent text-accent-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <Map />
            Map
          </Link>
          {session && (
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "flex flex-1 justify-start font-medium text-md",
                pathname.endsWith("/settings") &&
                  "bg-accent text-accent-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              <Cog />
              Settings
            </Link>
          )}
        </div>
        <div className="flex px-4">
          <Separator />
        </div>
        {/*<div className="flex flex-col pl-8 pr-4 gap-2">
          <span className="text-sm text-muted-foreground">Favorites</span>
          <Button
            variant="ghost"
            className="flex flex-1 justify-start font-normal text-sm"
            onClick={() => {}}
          >
            <Star />
            2000 rue Berri
          </Button>
          <Button
            variant="ghost"
            className="flex flex-1 justify-start font-normal text-sm"
            onClick={() => {}}
          >
            <Star />
            615 Rue Belmont
          </Button>
        </div>*/}
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
