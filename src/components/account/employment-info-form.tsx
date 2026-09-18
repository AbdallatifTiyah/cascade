"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/onboarding/option-card";
import { EMPLOYMENT_STATUSES } from "@/lib/constants";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedEmploymentStatus } from "@/lib/i18n/labels";

export interface EmploymentInfo {
  employmentStatus: string | null;
  jobTitle: string | null;
  employerName: string | null;
  industry: string | null;
  monthlyIncome: number | null;
  yearsExperience: number | null;
}

export function EmploymentInfoForm({ user, locale = "en" }: { user: EmploymentInfo; locale?: Locale }) {
  const router = useRouter();
  const d = getDictionary(locale);
  const t = d.personalInfoForm;
  const o = d.onboarding;
  const [form, setForm] = useState({
    employmentStatus: user.employmentStatus ?? "",
    jobTitle: user.jobTitle ?? "",
    employerName: user.employerName ?? "",
    industry: user.industry ?? "",
    monthlyIncome: user.monthlyIncome ?? ("" as number | ""),
    yearsExperience: user.yearsExperience ?? ("" as number | ""),
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monthlyIncome: form.monthlyIncome === "" ? undefined : form.monthlyIncome,
          yearsExperience: form.yearsExperience === "" ? undefined : form.yearsExperience,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? t.somethingWrong });
        return;
      }
      setMessage({ type: "success", text: t.updated });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: t.networkError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {EMPLOYMENT_STATUSES.map((opt) => (
          <Chip
            key={opt.value}
            selected={form.employmentStatus === opt.value}
            onClick={() => setForm({ ...form, employmentStatus: opt.value })}
          >
            {localizedEmploymentStatus(opt.value, locale, opt.label)}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">{o.jobTitle}</Label>
          <Input id="jobTitle" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employerName">{o.employerName}</Label>
          <Input id="employerName" value={form.employerName} onChange={(e) => setForm({ ...form, employerName: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">{o.industry}</Label>
          <Input id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">{o.yearsExperience}</Label>
          <Input
            id="yearsExperience"
            type="number"
            min={0}
            value={form.yearsExperience}
            onChange={(e) => setForm({ ...form, yearsExperience: e.target.value === "" ? "" : Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="monthlyIncome">{o.monthlyIncome}</Label>
        <Input
          id="monthlyIncome"
          type="number"
          min={0}
          value={form.monthlyIncome}
          onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value === "" ? "" : Number(e.target.value) })}
        />
      </div>
      {message && <p className={message.type === "error" ? "text-sm text-destructive" : "text-sm text-success"}>{message.text}</p>}
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t.saveChanges}
      </Button>
    </form>
  );
}
