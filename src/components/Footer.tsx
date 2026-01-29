import styled from "styled-components";
import { useTranslations } from "next-intl";

import { PortfolioLink } from "./PortfolioLink";
import { FeedbackLink } from "./FeedbackLink";
import { LocaleSwitch } from "../i18n/LocaleSwitch";

const HeartPulse = styled.span`
  @keyframes heart-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  animation: heart-pulse 2s ease-in-out infinite;
  display: inline-block;
`;

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-4 text-muted-foreground font-semibold">
          <div className="flex items-center justify-center">
            <LocaleSwitch />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <FeedbackLink />
            </div>
            <div>
              <span>
                {t("madeWith")}
                <HeartPulse className="mx-1">💖</HeartPulse>
                {t("fromMontreal")}
              </span>
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
