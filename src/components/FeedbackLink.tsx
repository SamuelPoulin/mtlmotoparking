"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function FeedbackLink() {
  return (
    <div className="text-sm text-muted-foreground font-semibold">
      <Link
        href="https://mtlmotoparking.userjot.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4"
        onClick={() => posthog.capture("feedback_link_clicked")}
      >
        Give me feedback
      </Link>
    </div>
  );
}
