"use client";

import { Trash } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

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
import { useSession } from "@/src/lib/auth-client";
import { useTranslations } from "next-intl";

export default function SettingsClient() {
  const t = useTranslations("SettingsPage");
  const { data: session, isPending: isSessionPending } = useSession();

  useEffect(() => {
    if (isSessionPending) return;

    if (!session) {
      redirect("/");
    }
  }, [isSessionPending, session]);

  return (
    <div className="container max-w-200 mx-auto px-6 py-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <section className="flex flex-col gap-3">
          <Card>
            <CardContent className="px-5 py-1">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {!isSessionPending && session && (
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={session?.user.image ?? ""}
                        alt={session?.user.name}
                      />
                      <AvatarFallback className="text-xl">
                        {session?.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {/*<Button
                  // onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  aria-label="Change profile picture"
                >
                  <Camera className="h-3 w-3" />
                </Button>*/}
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <p className="text-base">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                  {/*<Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs"
                  // onClick={() => fileInputRef.current?.click()}
                >
                  Change photo
                </Button>*/}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <Card className="border-destructive/25">
            <CardContent className="px-5 py-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm">{t("deleteAccount.title")}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("deleteAccount.description")}
                  </p>
                </div>
                <Dialog>
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
                        // onClick={() => setShowDeleteDialog(false)}
                        // disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        // onClick={handleDelete}
                        // disabled={isDeleting}
                      >
                        {/*{isDeleting && <Spinner className="size-4" />}*/}
                        {/*{isDeleting ? t("deleting") : t("delete")}*/}
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
