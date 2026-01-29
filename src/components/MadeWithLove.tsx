import styled from "styled-components";
import { useTranslations } from "next-intl";

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

export function MadeWithLove() {
  const t = useTranslations();

  return (
    <span>
      {t("madeWith")}
      <HeartPulse className="mx-1">💖</HeartPulse>
      {t("fromMontreal")}
    </span>
  );
}
