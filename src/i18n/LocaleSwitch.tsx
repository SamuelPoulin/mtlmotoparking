"use client";

import { useLocale } from "next-intl";
import { Switch } from "../components/ui/switch";
import { useRouter, usePathname } from "./navigation";

export function LocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Toggle between 'en' and 'fr'
  function handleChange(checked: boolean) {
    const nextLocale = checked ? "fr" : "en";
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex items-center gap-1">
      en
      <Switch
        className="mx-1"
        checked={locale === "fr"}
        onCheckedChange={handleChange}
        aria-label="Switch language"
      />
      fr
    </div>
  );
}
