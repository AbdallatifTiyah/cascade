import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminSidebar />
      <main className="px-4 py-6 sm:px-6 sm:py-8 md:ml-64 md:px-8">{children}</main>
    </div>
  );
}
