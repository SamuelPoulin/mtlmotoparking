"use client";

import Link from "next/link";

import { KofiLink } from "./KofiLink";
// import { Button } from "./ui/button";
// import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="flex border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="flex items-center justify-center">
            {/*<Button
              variant="ghost"
              size="icon"
              onClick={() => null}
              aria-label="Toggle menu"
            >
              <Menu />
            </Button>*/}
          </div>
          <Link href="/" className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              mtlmotoparking
            </span>
          </Link>
        </div>
        <KofiLink />
      </div>
    </header>
  );
}
