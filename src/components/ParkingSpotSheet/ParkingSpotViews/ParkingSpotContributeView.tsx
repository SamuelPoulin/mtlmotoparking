"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { ParkingUpdateForm } from "@/src/components/ParkingSpotSheet/ParkingUpdateForm";
import { SheetHeader, SheetTitle } from "@/src/components/ui/sheet";

export function ParkingSpotContributeView() {
  const t = useTranslations();

  return (
    <motion.div
      key="update-view"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col w-full"
    >
      <SheetHeader className="pl-0">
        <div className="flex items-center gap-2">
          <SheetTitle>{t("MapPage.community.contribute")}</SheetTitle>
        </div>
      </SheetHeader>
      <ParkingUpdateForm />
    </motion.div>
  );
}
