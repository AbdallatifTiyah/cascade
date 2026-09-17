"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, Building2, FolderKanban, Wallet, Bell, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { Avatar } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/profile", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: Building2 },
  { href: "/my-project", label: "My Project", icon: FolderKanban },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/account", label: "Profile", icon: User },
];

export function CustomerNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [firstName, lastName] = (user?.name ?? "").split(" ");

  return (
    <>
      {/* Desktop top bar */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-background/90 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="relative rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Link>
            <Avatar firstName={firstName || "U"} lastName={lastName || ""} />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:hidden">
        <Logo />
        <Link href="/notifications" className="rounded-full p-2 text-muted-foreground" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Link>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur-md md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
