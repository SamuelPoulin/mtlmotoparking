"use client";

import { signOut, signIn, useSession } from "../lib/auth-client";
import { Button } from "./ui/button";

export function SignUpClient() {
  const handleSignUp = async () => {
    await signIn.social({
      provider: "google",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const { data: session } = useSession();

  console.log({ session });

  return (
    <div>
      <h1>Sign Up</h1>
      {!session && <Button onClick={handleSignUp}>Sign in with Google</Button>}
      {session && <Button onClick={handleSignOut}>Sign out</Button>}
    </div>
  );
}
