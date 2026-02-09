"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import posthog from "posthog-js";

export function FeedbackLink() {
  const t = useTranslations("Footer");

  return (
    <div className="text-sm text-muted-foreground font-semibold">
      <Link
        href="https://mtlmotoparking.userjot.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4"
        onClick={() => posthog.capture("feedback_link_clicked")}
      >
        {t("giveFeedback")}
      </Link>
    </div>
  );
}
