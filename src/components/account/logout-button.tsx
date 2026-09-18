"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";

export function LogoutButton({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  return (
    <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="h-4 w-4" />
      {t.logoutButton}
    </Button>
  );
}
