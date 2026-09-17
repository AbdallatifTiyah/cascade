import { SiteHeader } from "@/components/layout/site-header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyCascade } from "@/components/landing/why-cascade";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { GroupDevelopment } from "@/components/landing/group-development";
import { FinancialPlanning } from "@/components/landing/financial-planning";
import { ConstructionTransparency } from "@/components/landing/construction-transparency";
import { FinalCta } from "@/components/landing/final-cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <HowItWorks />
      <WhyCascade />
      <FeaturedProjects />
      <GroupDevelopment />
      <FinancialPlanning />
      <ConstructionTransparency />
      <FinalCta />
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <p>Cascade Real Estate Investment &amp; Development · Demo build</p>
      </footer>
    </div>
  );
}
