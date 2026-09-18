import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  const t = getDictionary(getLocale());

  return (
    <AuthShell title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      <LoginForm t={t} />
    </AuthShell>
  );
}
