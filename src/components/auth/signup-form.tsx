"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/en";

export function SignupForm({ t }: { t: Dictionary }) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.auth.somethingWentWrong);
        return;
      }
      setUserId(data.userId);
      setDemoOtp(data.demoOtp);
      setCredentials({ email: form.email, password: form.password });
      setStep("otp");
    } catch {
      setError(t.auth.networkError);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.auth.verificationFailed);
        return;
      }
      const result = await signIn("credentials", { ...credentials, redirect: false });
      if (result?.error) {
        setError(t.auth.accountCreatedLoginFailed);
        router.push("/login");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError(t.auth.networkError);
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <p className="font-medium text-foreground">{t.auth.verifyEmail}</p>
            <p className="mt-1 text-muted-foreground">
              {t.auth.demoModePrefix} <span className="font-tabular font-semibold text-foreground">{demoOtp}</span>.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">{t.auth.sixDigitCode}</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="text-center text-lg tracking-[0.5em] font-tabular"
            dir="ltr"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.auth.verifyContinue}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t.auth.firstName}</Label>
          <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoComplete="given-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t.auth.lastName}</Label>
          <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="family-name" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t.auth.emailLabel}</Label>
        <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t.auth.phoneOptional}</Label>
        <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" placeholder="+970 59 000 0000" dir="ltr" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t.auth.passwordLabel}</Label>
        <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t.auth.createAccount}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.alreadyHaveAccount}{" "}
        <a href="/login" className="font-medium text-foreground underline underline-offset-4">
          {t.auth.loginLink}
        </a>
      </p>
    </form>
  );
}
