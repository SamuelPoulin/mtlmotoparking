"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { FullnessSlider } from "@/src/components/ParkingSpotSheet/FullnessSlider";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { Textarea } from "@/src/components/ui/textarea";
import { useStore } from "@/src/lib/zustand/store";

type CloudinarySignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
};

type Props = {
  parkingId: number;
};

export function ParkingUpdateForm({ parkingId }: Props) {
  const t = useTranslations("MapPage.community");
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullness, setFullness] = useState(0);
  const [description, setDescription] = useState("");
  const { setShowContributeView } = useStore();

  const DESCRIPTION_MAX_LENGTH = 280;

  const { data: canContributeData, isLoading: isCheckingContribution } =
    useQuery<{
      canContribute: boolean;
      reason: string | null;
    }>({
      queryKey: ["can-contribute", parkingId],
      queryFn: async () => {
        const res = await fetch(
          `/api/contributions/check?parking_id=${parkingId}`,
        );
        if (!res.ok) return { canContribute: false, reason: "error" };
        return res.json();
      },
    });

  const canContribute = canContributeData?.canContribute ?? true;

  const { data: cloudinaryParams } = useQuery<CloudinarySignature>({
    queryKey: ["cloudinary-signature"],
    queryFn: async () => {
      const res = await fetch("/api/sign-cloudinary-params", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to get signature");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const uploadToCloudinary = useMutation({
    mutationFn: async (file: File) => {
      if (!cloudinaryParams) throw new Error("No signature available");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", cloudinaryParams.apiKey);
      formData.append("timestamp", String(cloudinaryParams.timestamp));
      formData.append("signature", cloudinaryParams.signature);
      formData.append("upload_preset", cloudinaryParams.uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryParams.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  });

  const submitContribution = useMutation({
    mutationFn: async (data: {
      cloudinary_public_id: string;
      cloudinary_url: string;
      fullness: number;
      description: string;
    }) => {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parking_id: parkingId,
          cloudinary_public_id: data.cloudinary_public_id,
          cloudinary_url: data.cloudinary_url,
          fullness: data.fullness,
          description: data.description || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributions", parkingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["can-contribute", parkingId],
      });
      posthog.capture("contribution_submitted", {
        parking_id: parkingId,
      });
      toast.success(t("contributeSuccess"));
      setShowContributeView(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !canContribute) return;

    const uploadResult = await uploadToCloudinary.mutateAsync(selectedFile);

    await submitContribution.mutateAsync({
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_url: uploadResult.secure_url,
      fullness,
      description,
    });
  };

  const isSubmitting =
    uploadToCloudinary.isPending || submitContribution.isPending;

  return (
    <div className="flex flex-col gap-4">
      {!isCheckingContribution && !canContributeData?.canContribute && (
        <p className="text-sm text-destructive">{t("dailyLimitReached")}</p>
      )}

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
          {previewUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl}
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
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {t("descriptionTextbox.label")}
          </label>
          <span className="text-xs text-muted-foreground">
            {description.length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          placeholder={t("descriptionTextbox.placeholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX_LENGTH}
          rows={3}
          className="resize-none"
        />
      </div>

      {submitContribution.isError && (
        <p className="text-sm text-destructive">
          {submitContribution.error?.message || t("submitError")}
        </p>
      )}

      <Button
        className="flex flex-1 mt-3 p-4 text-md font-semibold"
        disabled={
          isSubmitting ||
          !selectedFile ||
          !canContribute ||
          isCheckingContribution
        }
        onClick={handleSubmit}
      >
        {isSubmitting && <Spinner className="size-4" />}
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </div>
  );
}
