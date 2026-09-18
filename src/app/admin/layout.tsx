import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const locale = getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminSidebar locale={locale} t={t} />
      <main className="px-4 py-6 sm:px-6 sm:py-8 md:ms-64 md:px-8">{children}</main>
    </div>
  );
}
