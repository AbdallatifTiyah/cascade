"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AnnouncementForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, title, body }),
    });
    setTitle("");
    setBody("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="announcement-title">Title</Label>
        <Input id="announcement-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="announcement-body">Message</Label>
        <Textarea id="announcement-body" required value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Post announcement
      </Button>
    </form>
  );
}
