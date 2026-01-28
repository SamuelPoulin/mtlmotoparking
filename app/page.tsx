import { ArrowRight, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

import MotorcycleScene from "@/src/components/three/MotorcycleScene";
import { Button } from "@/src/components/ui/button";

import styles from "./page.module.css";
import { PortfolioLink } from "@/src/components/social/PortfolioLink";
import { KofiLink } from "@/src/components/social/KofiLink";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              mtlmotoparking
            </span>
          </div>
          <KofiLink />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-8">
              <MotorcycleScene />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Montréal Motorcycle Parkings
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto text-pretty">
              Find and navigate to motorcycle parkings in Montréal
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="px-8 py-6 text-base font-medium rounded-full"
              >
                <Link href="/map">
                  Open Map
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card">
                <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    Find Parking
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sourced from the official Montréal database and updated
                    regularly
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card">
                <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Navigate</h3>
                  <p className="text-sm text-muted-foreground">
                    Open directions directly within your favorite navigation app
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
              <span>
                Made with <span className={styles.heartPulse}>💖</span> from
                Montréal
              </span>
            </div>
            <PortfolioLink />
          </div>
        </div>
      </footer>
    </div>
  );
}
