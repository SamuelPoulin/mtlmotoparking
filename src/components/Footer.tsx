import styled from "styled-components";

import { PortfolioLink } from "./PortfolioLink";
import { FeedbackLink } from "./FeedbackLink";

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
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <FeedbackLink />
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
            <span>
              Made with <HeartPulse>💖</HeartPulse> from Montréal
            </span>
          </div>
          <PortfolioLink />
        </div>
      </div>
    </footer>
  );
}
