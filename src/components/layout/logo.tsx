import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
        <Image src="/logo-icon.png" alt="Cascade" width={36} height={36} className="h-full w-full object-cover" priority />
      </span>
      <span className={cn("text-lg", dark && "text-white")}>Cascade</span>
    </Link>
  );
}
