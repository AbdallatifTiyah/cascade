import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Build My Property Plan" };

export default function SignupPage() {
  return (
    <AuthShell title="Build your property plan" subtitle="Create your account to get matched with real development opportunities.">
      <SignupForm />
    </AuthShell>
  );
}
