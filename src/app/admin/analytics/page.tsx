import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Analytics" };

const FUNNEL_ORDER = [
  "onboarding_started",
  "onboarding_completed",
  "property_profile_created",
  "project_viewed",
  "apartment_viewed",
  "reservation_started",
  "reservation_completed",
  "payment_viewed",
];

const EVENT_LABEL: Record<string, string> = {
  onboarding_started: "Onboarding started",
  onboarding_completed: "Onboarding completed",
  property_profile_created: "Property profile created",
  project_viewed: "Project viewed",
  apartment_viewed: "Apartment viewed",
  apartment_selected: "Apartment selected",
  reservation_started: "Reservation started",
  reservation_completed: "Reservation completed",
  payment_viewed: "Payment viewed",
};

export default async function AdminAnalyticsPage() {
  const counts = await db.analyticsEvent.groupBy({ by: ["name"], _count: { name: true } });
  const countMap = Object.fromEntries(counts.map((c) => [c.name, c._count.name]));
  const maxCount = Math.max(1, ...FUNNEL_ORDER.map((k) => countMap[k] ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Product analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Event volume across the core customer journey.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journey funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FUNNEL_ORDER.map((key) => {
            const count = countMap[key] ?? 0;
            const width = (count / maxCount) * 100;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{EVENT_LABEL[key]}</span>
                  <span className="font-tabular text-muted-foreground">{count}</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
