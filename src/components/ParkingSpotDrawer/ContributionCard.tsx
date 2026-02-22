"use client";

import posthog from "posthog-js";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Spinner } from "@/src/components/ui/spinner";
import type { ContributionWithUser } from "@/src/lib/api/contributions";
import { useSession } from "@/src/lib/auth-client";
import { toast } from "sonner";

export function ContributionCard({
  contribution,
  labels,
  onDeleteAction: onDelete,
}: {
  contribution: ContributionWithUser;
  labels: ReturnType<typeof useTranslations<"MapPage.community">>;
  onDeleteAction?: (contributionId: number) => void;
}) {
  const t = useTranslations("MapPage.community");
  const session = useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBanning, setIsBanning] = useState(false);

  const fullnessColor = (() => {
    if (contribution.fullness <= 20)
      return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (contribution.fullness <= 40)
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
    if (contribution.fullness <= 60)
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    if (contribution.fullness <= 80)
      return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  })();

  const fullnessLabel = (() => {
    if (contribution.fullness <= 20) return labels("empty");
    if (contribution.fullness <= 40) return labels("quiet");
    if (contribution.fullness <= 60) return labels("moderate");
    if (contribution.fullness <= 80) return labels("busy");
    return labels("full");
  })();

  const relativeTimeT = useTranslations("MapPage.community.relativeTime");

  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return relativeTimeT("justNow");
    if (diffMins < 60) return relativeTimeT("minutesAgo", { count: diffMins });
    if (diffHours < 24) return relativeTimeT("hoursAgo", { count: diffHours });
    if (diffDays < 7) return relativeTimeT("daysAgo", { count: diffDays });
    return new Date(date).toLocaleDateString();
  }

  const firstName = contribution.user?.name?.split(" ")[0] || "Anonymous";

  const isAdmin = session?.data?.user?.role === "admin";
  const isOwner = session?.data?.user?.id === contribution.user_id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contributions/${contribution.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contribution");
      }

      posthog.capture("contribution_deleted", {
        contribution_id: contribution.id,
        parking_id: contribution.parking_id,
      });

      onDelete?.(contribution.id);
    } catch (error) {
      console.error("Error deleting contribution:", error);
    } finally {
      toast.success(t("deleteSuccess"));
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBan = async () => {
    setIsBanning(true);
    try {
      const response = await fetch("/api/user/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: contribution.user_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to ban user");
      }

      onDelete?.(contribution.id);
    } catch (error) {
      console.error("Error banning user:", error);
    } finally {
      toast.success(t("banSuccess"));
      setIsBanning(false);
      setShowBanDialog(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-card border border-border rounded-lg">
      <div className="relative w-full h-48 rounded-md overflow-hidden">
        <Image
          src={contribution.cloudinary_url}
          alt="Parking spot photo"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {contribution.user?.image ? (
            <Image
              src={contribution.user.image}
              alt={firstName}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted" />
          )}
          <span className="text-sm font-medium">{firstName}</span>
        </div>
        <span
          className={`flex text-xs px-2 py-1 rounded-full gap-1 ${fullnessColor}`}
        >
          <span>{fullnessLabel}</span>
          <span>-</span>
          <span>{formatRelativeTime(contribution.createdAt)}</span>
        </span>
      </div>
      {contribution.description && (
        <p className="text-sm wrap-break-word text-muted-foreground">
          {contribution.description}
        </p>
      )}
      <div className="flex gap-2">
        {isAdmin && !isOwner && (
          <div className="basis-1/5 grow">
            <Button
              className="w-full"
              variant="destructive"
              size="sm"
              onClick={() => setShowBanDialog(true)}
            >
              {t("ban")}
            </Button>
          </div>
        )}
        {(isAdmin || isOwner) && (
          <div className="basis-4/5 grow">
            <Button
              className="w-full"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              {t("delete")}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteModal.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteModal.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Spinner className="size-4" />}
              {isDeleting ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("banModal.title")}</DialogTitle>
            <DialogDescription>{t("banModal.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBanDialog(false)}
              disabled={isBanning}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={isBanning}
            >
              {isBanning && <Spinner className="size-4" />}
              {isBanning ? t("banning") : t("ban")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ContributionSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3 bg-card border border-border rounded-lg">
      <Skeleton className="w-full h-32 rounded-md" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-20 h-4" />
        </div>
        <Skeleton className="w-12 h-3" />
      </div>
      <Skeleton className="w-16 h-5 rounded-full" />
    </div>
  );
}
