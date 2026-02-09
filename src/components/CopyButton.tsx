import { Copy, CopyCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";

type Props = {
  label?: string;
  item: string;
  content: string;
  onClick?: () => void;
};

export function CopyButton({ label, content, item, onClick }: Props) {
  const t = useTranslations();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);

    posthog.capture(`${item}_copied`, {
      content,
    });

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button variant="outline" onClick={onClick ? onClick : handleCopy}>
      {isCopied ? t("copied") : (label ?? t("copy"))}
      {isCopied ? <CopyCheck /> : <Copy />}
    </Button>
  );
}
