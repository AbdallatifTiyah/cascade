"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";

export function PasswordForm({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).passwordForm;
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? t.somethingWrong });
        return;
      }
      setMessage({ type: "success", text: t.updated });
      setForm({ currentPassword: "", newPassword: "" });
    } catch {
      setMessage({ type: "error", text: t.networkError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t.currentPassword}</Label>
        <Input id="currentPassword" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required dir="ltr" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">{t.newPassword}</Label>
        <Input id="newPassword" type="password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required dir="ltr" />
      </div>
      {message && <p className={message.type === "error" ? "text-sm text-destructive" : "text-sm text-success"}>{message.text}</p>}
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t.updatePassword}
      </Button>
    </form>
  );
}
