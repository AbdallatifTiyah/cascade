"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";

export function MarkAllReadButton({ disabled, locale = "en" }: { disabled?: boolean; locale?: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = getDictionary(locale);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/notifications/read-all", { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={disabled || loading}>
      {t.markAllReadButton}
    </Button>
  );
}
