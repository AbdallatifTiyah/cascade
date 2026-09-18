"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ConfirmReservationButton({ apartmentId, locale = "en" }: { apartmentId: string; locale?: Locale }) {
  const router = useRouter();
  const t = getDictionary(locale).reservationReview;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/apartments/${apartmentId}/reserve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (locale === "ar" ? "حدث خطأ ما." : "Something went wrong."));
        return;
      }
      router.push(`/reservation/${data.reservationId}`);
    } catch {
      setError(locale === "ar" ? "خطأ في الشبكة. حاول مرة أخرى." : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      <Button size="lg" className="w-full" onClick={handleConfirm} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t.reserveButton}
      </Button>
    </div>
  );
}
