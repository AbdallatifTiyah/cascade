"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/en";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [open, setOpen] = useState(false);

  const LINKS = [
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/projects", label: t.nav.exploreProjects },
    { href: "/#financial-planning", label: t.nav.financialPlanning },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher locale={locale} label={t.common.languageToggle} />
          <LinkButton href="/login" variant="ghost" size="sm">
            {t.nav.login}
          </LinkButton>
          <LinkButton href="/signup" variant="primary" size="sm">
            {t.nav.buildPlan}
          </LinkButton>
        </div>

        <button
          className="rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <LocaleSwitcher locale={locale} label={t.common.languageToggle} className="w-full justify-center" />
              <LinkButton href="/login" variant="outline" size="md">
                {t.nav.login}
              </LinkButton>
              <LinkButton href="/signup" variant="primary" size="md">
                {t.nav.buildPlan}
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
