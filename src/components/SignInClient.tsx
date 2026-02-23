"use client";

import { Construction } from "lucide-react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { FaFacebookF, FaGoogle } from "react-icons/fa";

import MotorcycleScene from "@/src/components/MotorcycleScene";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Spinner } from "@/src/components/ui/spinner";
import { signIn, signOut, useSession } from "@/src/lib/auth-client";

export function SignInClient() {
  const t = useTranslations();
  const { data: session, isPending, isRefetching } = useSession();

  const handleSignIn = async (provider: string) => {
    await signIn.social({ provider });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    if (session) {
      redirect("/");
    }
  }, [session]);

  if (isPending || isRefetching) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-4" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-20 md:py-32">
      <div className="max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center mb-8">
          <MotorcycleScene />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6 text-balance">
          {t("SignInPage.title")}
        </h1>

        <Separator className="mb-6" />

        {!session && (
          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSignIn("google")}>
              <FaGoogle className="mr-2" />
              {t("SignInPage.continueWith")} Google
            </Button>
            <div className="w-full mt-4">
              <div className="relative flex items-center gap-2">
                <Separator className="flex-1" />
                <div className="flex gap-2 text-muted-foreground text-nowrap animate-pulse">
                  {t("comingSoon")}
                  <Construction />
                </div>
                <Separator className="flex-1" />
              </div>
            </div>
            <Button disabled>
              <FaFacebookF className="mr-2" />
              {t("SignInPage.continueWith")} Facebook
            </Button>
          </div>
        )}
        {session && (
          <div className="flex flex-col">
            <Avatar>
              <AvatarImage
                src={session.user.image ?? ""}
                alt={session.user.name}
              />
              <AvatarFallback>{session.user.name[0]}</AvatarFallback>
            </Avatar>
            <p>{session.user.name}</p>
            <p>{session.user.email}</p>
            <Button onClick={handleSignOut}>Sign out</Button>
          </div>
        )}
      </div>
    </div>
  );
}
