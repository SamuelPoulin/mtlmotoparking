"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function PortfolioLink() {
  return (
    <div className="text-sm text-muted-foreground font-semibold">
      <span></span>© {new Date().getFullYear()}{" "}
      <Link
        href="https://samuelpoulin.ca/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4"
        onClick={() => posthog.capture("portfolio_link_clicked")}
      >
        Studio Poulin
      </Link>
    </div>
  );
}
