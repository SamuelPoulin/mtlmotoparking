import Link from "next/link";

import { HeaderMenu } from "@/src/components/layout/HeaderMenu";
import { KofiLink } from "@/src/components/layout/KofiLink";
import { ErrorToast } from "@/src/components/ErrorToast";

export function Header() {
  return (
    <header className="flex border-b border-border">
      <ErrorToast />
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="flex items-center justify-center">
            <HeaderMenu />
          </div>
          <Link href="/" className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              mtlmotoparking
            </span>
          </Link>
        </div>
        <div className="flex">
          <KofiLink />
        </div>
      </div>
    </header>
  );
}
