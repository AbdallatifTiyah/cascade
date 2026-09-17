import { auth } from "@/auth";
import { CustomerNav } from "@/components/layout/customer-nav";
import { SiteHeader } from "@/components/layout/site-header";

/** Public browsing surfaces (projects, apartments) render the full customer
 * shell once a visitor is signed in, but fall back to the marketing header
 * for anonymous visitors following the landing page's "Explore Projects" CTA. */
export async function AdaptiveHeader() {
  const session = await auth();
  return session?.user ? <CustomerNav /> : <SiteHeader />;
}
