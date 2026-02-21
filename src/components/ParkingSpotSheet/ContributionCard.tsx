"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Skeleton } from "@/src/components/ui/skeleton";
import type { ContributionWithUser } from "@/src/lib/api/contributions";
import { useSession } from "@/src/lib/auth-client";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export function ContributionCard({
  contribution,
  labels,
}: {
  contribution: ContributionWithUser;
  labels: ReturnType<typeof useTranslations<"MapPage.community">>;
}) {
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
              alt={contribution.user.name || "User"}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted" />
          )}
          <span className="text-sm font-medium">
            {contribution.user?.name || "Anonymous"}
          </span>
        </div>
        <span
          className={`flex text-xs px-2 py-1 rounded-full gap-1 ${fullnessColor}`}
        >
          <span>{fullnessLabel}</span>
          <span>{formatRelativeTime(contribution.createdAt)}</span>
        </span>
      </div>
      {contribution.description && (
        <p className="text-sm wrap-break-word text-muted-foreground">
          {contribution.description}
        </p>
      )}
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
