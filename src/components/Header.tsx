import Link from "next/link";

import { KofiLink } from "./KofiLink";
import { HeaderMenu } from "./HeaderMenu";
import { LocaleSwitch } from "../i18n/LocaleSwitch";

export function Header() {
  return (
    <header className="flex border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="md:hidden flex items-center justify-center">
            <HeaderMenu />
          </div>
          <Link href="/" className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              mtlmotoparking
            </span>
          </Link>
        </div>
        <div className="flex gap-4">
          <div className="hidden md:flex items-center">
            <LocaleSwitch />
          </div>
          <KofiLink />
        </div>
      </div>
    </header>
  );
}
