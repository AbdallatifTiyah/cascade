import type { Metadata } from "next";
import { getActiveWeights } from "@/lib/matching/service";
import { MatchingConfigForm } from "@/components/admin/matching-config-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Matching Configuration" };

export default async function AdminMatchingPage() {
  const weights = await getActiveWeights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Matching engine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust how much each criterion contributes to a customer's match score. Changes apply to every future match calculation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MatchingConfigForm initialWeights={weights} />

        <Card>
          <CardHeader>
            <CardTitle>How scoring works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Each project is scored against a customer's property profile using a weighted average of eight criteria: location,
              monthly affordability, initial payment, apartment size, bedrooms, delivery timeline, payment duration, and amenities.
            </p>
            <p>
              For apartment-level criteria, Cascade evaluates the best-fitting available unit in each project — so the score
              reflects the apartment a customer would actually want, not just an average.
            </p>
            <p>
              Every score is stored with its full breakdown and the weights used at calculation time, so results stay
              deterministic and auditable (spec #55).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
