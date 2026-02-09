"use client";

import { Menu } from "lucide-react";

import { FeedbackLink } from "@/src/components/layout/FeedbackLink";
import { MadeWithLove } from "@/src/components/layout/MadeWithLove";
import { PortfolioLink } from "@/src/components/layout/PortfolioLink";
import { ThemeSwitcher } from "@/src/components/layout/ThemeSwitcher";
import { Button } from "@/src/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/src/components/ui/drawer";
import { LocaleSwitch } from "@/src/i18n/LocaleSwitch";

export function HeaderMenu() {
  return (
    <Drawer direction="left">
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
      <DrawerContent className="flex justify-between">
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col items-center justify-center pb-8 pt-2 gap-8">
          <ThemeSwitcher />
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
