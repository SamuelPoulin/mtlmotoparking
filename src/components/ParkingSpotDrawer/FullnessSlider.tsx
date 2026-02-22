"use client";

import { Motorbike } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Slider } from "@/src/components/ui/slider";

type FullnessSliderProps = {
  value: number;
  onChangeAction: (value: number) => void;
  labels: {
    howFull: string;
    empty: string;
    quiet: string;
    moderate: string;
    busy: string;
    full: string;
  };
};

function getLevelLabel(
  value: number,
  labels: FullnessSliderProps["labels"],
): string {
  if (value <= 15) return labels.empty;
  if (value <= 35) return labels.quiet;
  if (value <= 60) return labels.moderate;
  if (value <= 85) return labels.busy;
  return labels.full;
}

function getIconCount(value: number): number {
  return Math.round(value / 20);
}

export function FullnessSlider({
  value,
  onChangeAction: onChange,
  labels,
}: FullnessSliderProps) {
  const levelLabel = getLevelLabel(value, labels);
  const iconCount = getIconCount(value);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{labels.howFull}</span>
        <span className="text-sm text-muted-foreground">
          {levelLabel} ({value}%)
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        max={100}
        step={5}
        className="w-full"
      />

      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{labels.empty}</span>
        <div className="flex gap-1 justify-center min-w-20">
          <AnimatePresence mode="popLayout">
            {Array.from({ length: iconCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <Motorbike className="h-4 w-4 text-primary" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <span className="text-xs text-muted-foreground">{labels.full}</span>
      </div>
    </div>
  );
}
