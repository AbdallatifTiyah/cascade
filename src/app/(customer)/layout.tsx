import { CustomerNav } from "@/components/layout/customer-nav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <CustomerNav />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-12">{children}</main>
    </div>
  );
}
