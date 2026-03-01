"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Circle,
  CircleCheck,
  Construction,
  Map,
  Star,
  Trash,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FaApple, FaGoogle, FaWaze } from "react-icons/fa";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Spinner } from "@/src/components/ui/spinner";
import { useSession } from "@/src/lib/auth-client";
import type { UserSettingsResponse } from "@/app/api/user/settings/route";
import {
  ContributionCard,
  ContributionSkeleton,
} from "@/src/components/ParkingSpotDrawer/ContributionCard";
import { ContributionWithUser } from "../lib/api/contributions";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

type NavigationAppProps = {
  name: string;
  value: string | null;
  icon?: ReactNode;
  selected: boolean;
  setSelected: (name: string | null) => void;
  disabled?: boolean;
};

const NavigationAppButton = ({
  name,
  value,
  selected,
  icon,
  setSelected,
  disabled,
}: NavigationAppProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Button
        variant="outline"
        className="flex justify-between w-full py-6"
        onClick={() => setSelected(value)}
        disabled={disabled}
      >
        <div className="flex items-center gap-3">
          {icon}
          {name}
        </div>
        {selected ? (
          <CircleCheck className="size-5" />
        ) : (
          <Circle className="size-5" />
        )}
      </Button>
    </motion.div>
  );
};

const UserSkeleton = () => {
  return (
    <div className="flex flex-1 items-center p-2 gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
    </div>
  );
};

export default function SettingsClient() {
  const t = useTranslations("SettingsPage");
  const queryClient = useQueryClient();
  const {
    data: session,
    isPending: isSessionPending,
    refetch: refetchSession,
  } = useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [offset, setOffset] = useState(0);
  const [allContributions, setAllContributions] = useState<
    UserSettingsResponse["contributions"]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const { data, isLoading: isLoadingSettings } = useQuery<UserSettingsResponse>(
    {
      queryKey: ["user-settings", offset],
      queryFn: async () => {
        const res = await fetch(`/api/user/settings?offset=${offset}`);
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
      },
      enabled: !!session,
    },
  );

  useEffect(() => {
    if (data?.contributions) {
      if (offset === 0) {
        setAllContributions(data.contributions);
      } else {
        setAllContributions((prev) => [...prev, ...data.contributions]);
      }
      setTotalCount(data.total);
      setHasInitialLoad(true);
    }
  }, [data?.contributions, data?.total, offset]);

  const updateNavigationApp = useMutation({
    mutationFn: async (navigationApp: string | null) => {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navigationApp }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["user-settings", offset],
        (old: UserSettingsResponse | undefined) => ({
          ...old,
          navigationApp: data.navigationApp,
        }),
      );
      queryClient.setQueryData(
        ["user-settings"],
        (old: UserSettingsResponse | undefined) => ({
          ...old,
          navigationApp: data.navigationApp,
        }),
      );
      toast.success(t("navigationApp.saved"));
    },
    onError: () => {
      toast.error(t("navigationApp.error"));
    },
  });

  const NAVIGATION_APPS = [
    {
      name: t("navigationApp.none"),
      value: null,
    },
    {
      name: "Waze",
      value: "waze",
      icon: <FaWaze className="size-5" />,
    },

    {
      name: "Google",
      value: "google",
      icon: <FaGoogle className="size-5" />,
    },

    {
      name: "Apple",
      value: "apple",
      icon: <FaApple className="size-5" />,
    },
  ];

  useEffect(() => {
    if (isSessionPending) return;

    if (!session) {
      redirect("/");
    }
  }, [isSessionPending, session]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success(t("deleteAccount.success"));
      refetchSession();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("deleteAccount.error"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleContributionDelete = (
    contributionId: number,
    parkingId: number,
  ) => {
    setAllContributions((prev) => prev.filter((c) => c.id !== contributionId));
    queryClient.setQueryData<{ contributions: ContributionWithUser[] }>(
      ["contributions", parkingId],
      (oldData) => {
        if (!oldData) return oldData;
        return {
          contributions: oldData.contributions.filter(
            (c) => c.id !== contributionId,
          ),
        };
      },
    );
    queryClient.invalidateQueries({
      queryKey: ["can-contribute", parkingId],
    });
    queryClient.invalidateQueries({
      queryKey: ["user-settings"],
    });
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + 5);
  };

  return (
    <div className="container max-w-200 mx-auto px-6 py-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <section className="flex flex-col gap-3">
          <Card>
            <CardContent className="px-5 py-1">
              <div className="flex items-center p-2 gap-3">
                {isSessionPending && !session && <UserSkeleton />}
                {!isSessionPending && session && (
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={session?.user.image ?? ""}
                      alt={session?.user.name}
                    />
                    <AvatarFallback className="text-xl">
                      {session?.user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col flex-1 gap-1">
                  <p className="text-base">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <Card className="border-destructive/20">
            <CardContent className="px-5 py-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm">{t("deleteAccount.title")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("deleteAccount.description")}
                  </p>
                </div>
                <Dialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 shrink-0"
                    >
                      <Trash className="h-4 w-4" />
                      {t("deleteAccount.title")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("deleteAccount.modalTitle")}</DialogTitle>
                      <DialogDescription>
                        {t("deleteAccount.modalDescription")}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={isDeleting}
                      >
                        {t("deleteAccount.modalCancel")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting && <Spinner className="size-4" />}
                        {isDeleting
                          ? t("deleteAccount.deleting")
                          : t("deleteAccount.modalConfirm")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </section>

        <h1 className="flex flex-col justify-center gap-2">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex items-center justify-center p-3 bg-muted rounded-full">
              <Map className="size-4" />
            </div>
            {t("navigationApp.title")}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("navigationApp.description")}
          </p>
        </h1>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {NAVIGATION_APPS.map(({ name, value, icon }) => (
            <NavigationAppButton
              key={value}
              name={name}
              value={value}
              icon={icon}
              selected={data?.navigationApp === value}
              setSelected={updateNavigationApp.mutate}
              disabled={isLoadingSettings || updateNavigationApp.isPending}
            />
          ))}
        </section>

        <div className="flex justify-between">
          <h1 className="text-xl font-semibold">{t("contributions.title")}</h1>
          <Badge className="bg-green-700 text-white font-semibold">
            <Star strokeWidth={3} className="size-4" /> {totalCount}{" "}
            {t("contributions.total")}
          </Badge>
        </div>
        <section className="flex flex-col gap-3">
          {!hasInitialLoad && <ContributionSkeleton />}
          {hasInitialLoad && allContributions.length === 0 && (
            <div className="flex gap-4 p-4 text-sm justify-center bg-card border border-border w-full rounded-lg">
              <div className="flex items-center">
                <div className="bg-muted p-4 flex justify-center rounded-full">
                  <Construction className="animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-md">{t("contributions.emptyTitle")}</span>
                <span className="text-sm text-muted-foreground">
                  {t("contributions.emptyDescription")}
                </span>
              </div>
            </div>
          )}
          {hasInitialLoad && allContributions.length > 0 && (
            <>
              {allContributions.map((contribution) => (
                <ContributionCard
                  key={contribution.id}
                  contribution={contribution}
                  onDeleteAction={handleContributionDelete}
                />
              ))}

              {allContributions.length < totalCount && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={isLoadingSettings}
                  >
                    {isLoadingSettings && <Spinner className="size-4" />}
                    {t("contributions.showMore")}
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
