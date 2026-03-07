"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

export function ErrorToast() {
  const search = useSearchParams();
  const t = useTranslations();

  const errorDescription = search.get("error_description");
  const errorCode = search.get("error");

  useEffect(() => {
    if (errorDescription) {
      toast.error(errorDescription);
      return;
    }

    if (errorCode) {
      toast.error(t("SignInPage.socialError"));
    }
  }, [errorDescription, errorCode, t]);

  return <></>;
}
