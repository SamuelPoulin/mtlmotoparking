"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import MotorcycleScene from "./MotorcycleScene";
import { KofiLink } from "./KofiLink";

export function Header() {
  const pathname = usePathname();

  const showMotorcycleScene = pathname !== "/";

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {showMotorcycleScene && (
            <div className="h-8 w-8">
              <MotorcycleScene />
            </div>
          )}
          <span className="text-lg font-semibold tracking-tight text-foreground">
            mtlmotoparking
          </span>
        </Link>
        <KofiLink />
      </div>
    </header>
  );
}
