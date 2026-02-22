import { ArrowRight, ExternalLink, MapPin, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import MotorcycleScene from "@/src/components/MotorcycleScene";
import { Button } from "@/src/components/ui/button";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="container mx-auto px-6 py-20 pt-4 md:py-32 md:pt-8">
      <div className="flex flex-col items-center max-w-3xl mx-auto text-center">
        <Link
          href="https://mtlmotoparking.userjot.com/updates/p/community-contributions"
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit inline-flex items-center gap-2 px-4 py-2 mb-12 rounded-full bg-muted text-primary hover:bg-muted-foreground/15 transition-colors"
        >
          <span>🎉</span>
          <span className="font-medium">{t("communityContributions")}</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
        <div className="inline-flex items-center justify-center mb-8">
          <MotorcycleScene />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance">
          {t("title")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto text-pretty">
          {t("description")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="px-8 py-6 text-base font-medium rounded-full"
          >
            <Link href="/map">
              {t("openMapButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card">
            <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <MapPin className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex flex-col gap-2 text-left ">
              <h3 className="font-semibold text-foreground">
                {t("findParkingTip.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("findParkingTip.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card">
            <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Navigation className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <h3 className="font-semibold text-foreground">
                {t("navigateTip.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("navigateTip.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
