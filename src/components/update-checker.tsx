"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";

const CHECK_INTERVAL_MS = 60_000;

/** Detects when a newer build has been deployed while this tab/app session
 * is still open, and offers a reload — instead of the user silently hitting
 * broken navigations (stale JS chunk 404s) or never seeing new features.
 * Matters most for the Capacitor mobile shell, whose WebView can stay
 * loaded on an old build for days across app switches. */
export function UpdateChecker({ initialVersion, locale = "en" }: { initialVersion: string; locale?: Locale }) {
  const t = getDictionary(locale).appUpdate;
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const checking = useRef(false);

  useEffect(() => {
    async function check() {
      if (checking.current) return;
      checking.current = true;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.version && data.version !== initialVersion) {
          setAvailable(true);
        }
      } catch {
        /* offline or transient — try again next interval */
      } finally {
        checking.current = false;
      }
    }

    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    // A stale client trying to load a chunk from a build that's no longer
    // served is a hard signal, not just a maybe — surface the prompt
    // immediately instead of waiting for the next poll.
    function onError(event: ErrorEvent | PromiseRejectionEvent) {
      const message = "reason" in event ? String(event.reason?.message ?? event.reason ?? "") : event.message ?? "";
      if (/ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(message)) {
        setAvailable(true);
      }
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
    };
  }, [initialVersion]);

  if (!available || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6" role="status">
      <div className="flex w-full max-w-sm items-start gap-3 rounded-2xl border border-accent/30 bg-card p-4 shadow-premium animate-fade-up">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <RefreshCw className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="accent" onClick={() => window.location.reload()}>
              {t.updateNow}
            </Button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {t.later}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t.later}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
