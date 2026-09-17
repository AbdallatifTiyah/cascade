import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({ firstName, lastName, className }: { firstName: string; lastName: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
        className
      )}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
