import { auth } from "@/auth";
import { CustomerNav } from "@/components/layout/customer-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

/** Public browsing surfaces (projects, apartments) render the full customer
 * shell once a visitor is signed in, but fall back to the marketing header
 * for anonymous visitors following the landing page's "Explore Projects" CTA. */
export async function AdaptiveHeader() {
  const session = await auth();
  const locale = getLocale();
  const t = getDictionary(locale);
  return session?.user ? <CustomerNav locale={locale} t={t} /> : <SiteHeader locale={locale} t={t} />;
}
