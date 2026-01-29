"use client";

import { PortfolioLink } from "./PortfolioLink";
import { FeedbackLink } from "./FeedbackLink";
import { MadeWithLove } from "./MadeWithLove";
import { usePathname } from "../i18n/navigation";

export function Footer() {
  const pathname = usePathname();

  const allowHiding = pathname !== "/";

  return (
    <footer
      className={`${allowHiding ? "hidden md:flex" : ""} border-t border-border`}
    >
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-4 text-muted-foreground font-semibold">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <FeedbackLink />
            </div>
            <div>
              <MadeWithLove />
            </div>
            <div>
              <PortfolioLink />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
