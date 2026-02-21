"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { ParkingUpdateForm } from "@/src/components/ParkingSpotSheet/ParkingUpdateForm";
import { Button } from "@/src/components/ui/button";
import { SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
import { useStore } from "@/src/lib/zustand/store";

type Props = {
  parkingId: number;
};

export function ParkingSpotContributeView({ parkingId }: Props) {
  const t = useTranslations();
  const { setShowContributeView } = useStore();

  const handleBack = () => {
    setShowContributeView(false);
  };

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
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SheetTitle>{t("MapPage.community.contribute")}</SheetTitle>
        </div>
      </SheetHeader>
      <ParkingUpdateForm parkingId={parkingId} />
    </motion.div>
  );
}
