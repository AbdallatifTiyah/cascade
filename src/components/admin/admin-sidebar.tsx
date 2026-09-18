"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Landmark,
  Building2,
  Home,
  Sparkles,
  Calculator,
  ClipboardCheck,
  Wallet,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/en";

export function AdminSidebar({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname();

  const NAV = [
    { href: "/admin", label: t.nav.admin.dashboard, icon: LayoutDashboard },
    { href: "/admin/demand", label: t.nav.admin.demand, icon: TrendingUp },
    { href: "/admin/users", label: t.nav.admin.users, icon: Users },
    { href: "/admin/lands", label: t.nav.admin.lands, icon: Landmark },
    { href: "/admin/projects", label: t.nav.admin.projects, icon: Building2 },
    { href: "/admin/apartments", label: t.nav.admin.apartments, icon: Home },
    { href: "/admin/matching", label: t.nav.admin.matching, icon: Sparkles },
    { href: "/admin/feasibility", label: t.nav.admin.feasibility, icon: Calculator },
    { href: "/admin/reservations", label: t.nav.admin.reservations, icon: ClipboardCheck },
    { href: "/admin/payments", label: t.nav.admin.payments, icon: Wallet },
    { href: "/admin/analytics", label: t.nav.admin.analytics, icon: BarChart3 },
  ];

  return (
    <>
      <aside className="fixed inset-y-0 start-0 hidden w-64 flex-col border-e border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
          <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t.nav.admin.badge}</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <LocaleSwitcher locale={locale} label={t.common.languageToggle} className="mb-2 w-full justify-center" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {t.nav.logout}
          </button>
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} label={t.common.languageToggle} />
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-muted-foreground">
            {t.nav.logout}
          </button>
        </div>
      </div>
      <nav className="scrollbar-none sticky top-[57px] z-30 flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
