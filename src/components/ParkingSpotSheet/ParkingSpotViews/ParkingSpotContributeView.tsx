"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

import { ParkingUpdateForm } from "@/src/components/ParkingSpotSheet/ParkingUpdateForm";
import { SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
import { useTranslations } from "next-intl";

export type ContributionData = {
  photoUrl: string | null;
  fullness: number;
  description: string;
};

type Props = {
  setShowContributeViewAction: (showContributeView: boolean) => void;
  handleUpdateSubmitAction: (data: ContributionData) => void;
};

export function ParkingSpotContributeView({
  setShowContributeViewAction,
  handleUpdateSubmitAction,
}: Props) {
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
          <button
            onClick={() => setShowContributeViewAction(false)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <SheetTitle>{t("MapPage.community.updateTitle")}</SheetTitle>
        </div>
      </SheetHeader>
      <ParkingUpdateForm
        onCancelAction={() => setShowContributeViewAction(false)}
        onSubmitAction={handleUpdateSubmitAction}
      />
    </motion.div>
  );
}
