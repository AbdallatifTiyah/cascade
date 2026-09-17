"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  { role: "Customer", email: "demo@cascade.dev", password: "Demo1234!" },
  { role: "Admin", email: "admin@cascade.dev", password: "Admin123!" },
];

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", { ...form, redirect: false });
      if (result?.error) {
        setError("Incorrect email or password.");
        return;
      }
      const session = await getSession();
      router.push(session?.user?.role === "ADMIN" ? "/admin" : "/profile");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to Cascade?{" "}
          <a href="/signup" className="font-medium text-foreground underline underline-offset-4">
            Build my property plan
          </a>
        </p>
      </form>

      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo accounts</p>
        <div className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => setForm({ email: acc.email, password: acc.password })}
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-secondary"
            >
              <span className="font-medium">{acc.role}</span>
              <span className="font-tabular text-muted-foreground">{acc.email}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
