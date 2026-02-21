"use client";

import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/src/components/ui/button";
import { FullnessSlider } from "@/src/components/ParkingSpotSheet/FullnessSlider";
import { Textarea } from "@/src/components/ui/textarea";

type ParkingUpdateFormProps = {
  onCancelAction: () => void;
  onSubmitAction: (data: {
    photoUrl: string | null;
    fullness: number;
    description: string;
  }) => void;
};

export function ParkingUpdateForm({
  onCancelAction: onCancel,
  onSubmitAction: onSubmit,
}: ParkingUpdateFormProps) {
  const t = useTranslations("MapPage.community");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fullness, setFullness] = useState(0);
  const [description, setDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    onSubmit({ photoUrl, fullness, description });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 pt-2">
        <div
          className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl h-36 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {photoUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={photoUrl}
                alt="Uploaded photo"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-full">
              <Camera className="h-8 w-8" />
              <span className="text-sm">{t("tapToUpload")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="py-2">
        <FullnessSlider
          value={fullness}
          onChangeAction={setFullness}
          labels={{
            howFull: t("howFull"),
            empty: t("empty"),
            quiet: t("quiet"),
            moderate: t("moderate"),
            busy: t("busy"),
            full: t("full"),
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          {t("descriptionTextbox.label")}
        </label>
        <Textarea
          placeholder={t("descriptionTextbox.placeholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button className="flex-1" onClick={handleSubmit}>
          {t("submit")}
        </Button>
      </div>
    </div>
  );
}
