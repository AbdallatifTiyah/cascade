"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/i18n/cookie";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ locale, label, className }: { locale: Locale; label: string; className?: string }) {
  const router = useRouter();

  function toggle() {
    const next: Locale = locale === "ar" ? "en" : "ar";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      {label}
    </button>
  );
}
