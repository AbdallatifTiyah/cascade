"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, LoaderCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export interface StageItem {
  id: string;
  name: string;
  status: string;
  plannedDate: Date | null;
  actualDate: Date | null;
  description: string | null;
}

export function ConstructionStageEditor({ stages }: { stages: StageItem[] }) {
  return (
    <div className="space-y-3">
      {stages.map((stage) => (
        <StageRow key={stage.id} stage={stage} />
      ))}
    </div>
  );
}

function StageRow({ stage }: { stage: StageItem }) {
  const router = useRouter();
  const [status, setStatus] = useState(stage.status);
  const [description, setDescription] = useState(stage.description ?? "");
  const [loading, setLoading] = useState(false);
  const dirty = status !== stage.status || description !== (stage.description ?? "");

  const done = stage.status === "COMPLETE";
  const current = stage.status === "IN_PROGRESS";

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/admin/construction/${stage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, description }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              done ? "bg-success text-success-foreground" : current ? "bg-accent text-accent-foreground" : "border border-border text-muted-foreground"
            )}
          >
            {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : current ? <LoaderCircle className="h-3.5 w-3.5 animate-spin [animation-duration:3s]" /> : <Circle className="h-3 w-3" />}
          </span>
          <p className="font-medium">{stage.name}</p>
        </div>
        {stage.actualDate && <span className="text-xs text-muted-foreground">Updated {formatDate(stage.actualDate)}</span>}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-start">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETE">Complete</option>
        </Select>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Update note shown to participants"
          className="min-h-[42px]"
        />
        <Button size="sm" onClick={handleSave} disabled={!dirty || loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}
