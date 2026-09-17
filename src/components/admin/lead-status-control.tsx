"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LEAD_STATUSES } from "@/lib/constants";

export function LeadStatusControl({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadStatus: status }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Button size="sm" variant="outline" onClick={handleSave} disabled={loading || status === currentStatus}>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Save
      </Button>
    </div>
  );
}
