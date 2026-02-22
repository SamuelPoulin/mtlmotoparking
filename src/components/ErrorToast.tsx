"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function ErrorToast() {
  const search = useSearchParams();

  const errorDescription = search.get("error_description");

  useEffect(() => {
    if (errorDescription) {
      toast.error(errorDescription);
    }
  }, [errorDescription]);

  return <></>;
}
