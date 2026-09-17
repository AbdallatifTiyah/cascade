export const APARTMENT_STATUS_STYLE: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "border-success/40 bg-success/10 text-success" },
  RESERVED: { label: "Reserved", className: "border-accent/40 bg-accent/10 text-accent" },
  ALLOCATED: { label: "Allocated", className: "border-accent/40 bg-accent/10 text-accent" },
  UNAVAILABLE: { label: "Unavailable", className: "border-border bg-muted text-muted-foreground" },
  COMPLETED: { label: "Completed", className: "border-border bg-muted text-muted-foreground" },
};
