"use client";

import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { motion } from "motion/react";

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
  const [isSigningIn, setIsSigningIn] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsSigningIn(provider);
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
          <div className="flex flex-col gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                className="w-full"
                onClick={() => handleSignIn("google")}
                disabled={isSigningIn !== null}
              >
                {isSigningIn === "google" ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <FaGoogle className="mr-2" />
                    {t("SignInPage.continueWith")} Google
                  </>
                )}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                className="w-full"
                onClick={() => handleSignIn("facebook")}
                disabled={isSigningIn !== null}
              >
                {isSigningIn === "facebook" ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <FaFacebookF className="mr-2" />
                    {t("SignInPage.continueWith")} Facebook
                  </>
                )}
              </Button>
            </motion.div>
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
