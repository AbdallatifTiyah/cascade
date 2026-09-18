import { CustomerNav } from "@/components/layout/customer-nav";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background">
      <CustomerNav locale={locale} t={t} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-12">{children}</main>
    </div>
  );
}
