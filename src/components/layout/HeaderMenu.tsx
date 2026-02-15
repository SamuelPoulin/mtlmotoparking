"use client";

import { Loader2, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { FeedbackLink } from "@/src/components/layout/FeedbackLink";
import { MadeWithLove } from "@/src/components/layout/MadeWithLove";
import { PortfolioLink } from "@/src/components/layout/PortfolioLink";
import { ThemeSwitcher } from "@/src/components/layout/ThemeSwitcher";
import { Button } from "@/src/components/ui/button";
import { DrawerTitle } from "@/src/components/ui/drawer";
import { LocaleSwitch } from "@/src/i18n/LocaleSwitch";
import { signOut, useSession } from "@/src/lib/auth-client";
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

const UserSkeleton = () => {
  return (
    <div className="flex items-center p-5 gap-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
};

export function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
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
            <Button
              variant="outline"
              asChild
              className="w-full"
              onClick={() => startSignInTransition(() => setOpen(false))}
            >
              <Link href="/sign-in">
                {isNavigatingToSignIn ? <Spinner /> : "Sign in"}
              </Link>
            </Button>
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
        <div className="flex flex-1 px-4">
          <Separator />
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
