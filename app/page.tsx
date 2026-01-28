import { ArrowRight, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

import MotorcycleScene from "@/src/components/MotorcycleScene";
import { Button } from "@/src/components/ui/button";

export default function Home() {
  return (
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
              <h3 className="font-semibold text-foreground">Find Parking</h3>
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
  );
}
