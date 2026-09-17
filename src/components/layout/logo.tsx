import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
          dark && "bg-white text-primary"
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 17 L9 9 L14 14 L21 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 5 H21 V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={cn("text-lg", dark && "text-white")}>Cascade</span>
    </Link>
  );
}
