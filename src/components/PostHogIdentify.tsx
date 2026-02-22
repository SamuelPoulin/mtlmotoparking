"use client";

import posthog from "posthog-js";
import { useSession } from "@/src/lib/auth-client";
import { useEffect } from "react";

export function PostHogIdentify() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    } else {
      posthog.reset();
    }
  }, [session]);

  return null;
}
