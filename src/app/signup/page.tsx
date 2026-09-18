import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Build My Property Plan" };

export default function SignupPage() {
  const t = getDictionary(getLocale());

  return (
    <AuthShell title={t.auth.signupTitle} subtitle={t.auth.signupSubtitle}>
      <SignupForm t={t} />
    </AuthShell>
  );
}
