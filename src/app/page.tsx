import { SiteHeader } from "@/components/layout/site-header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyCascade } from "@/components/landing/why-cascade";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { GroupDevelopment } from "@/components/landing/group-development";
import { FinancialPlanning } from "@/components/landing/financial-planning";
import { ConstructionTransparency } from "@/components/landing/construction-transparency";
import { FinalCta } from "@/components/landing/final-cta";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export default function LandingPage() {
  const locale = getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader locale={locale} t={t} />
      <Hero />
      <HowItWorks />
      <WhyCascade />
      <FeaturedProjects />
      <GroupDevelopment />
      <FinancialPlanning />
      <ConstructionTransparency />
      <FinalCta />
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <p>{t.landing.footer}</p>
      </footer>
    </div>
  );
}
