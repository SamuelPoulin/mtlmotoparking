"use client";

import { Menu } from "lucide-react";

import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { LocaleSwitch } from "../i18n/LocaleSwitch";
import { usePathname } from "../i18n/navigation";
import { FeedbackLink } from "./FeedbackLink";
import { MadeWithLove } from "./MadeWithLove";
import { PortfolioLink } from "./PortfolioLink";

export function HeaderMenu() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => null}
          aria-label="Toggle menu"
        >
          <Menu />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col items-center justify-center pb-8 pt-2 gap-8">
          <LocaleSwitch />
          <div className="flex flex-col gap-4 items-center">
            <FeedbackLink />
            <MadeWithLove />
            <PortfolioLink />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
