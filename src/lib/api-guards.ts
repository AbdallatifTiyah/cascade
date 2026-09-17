import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/** Route-handler counterpart to requireAdmin()/requireUser() — returns a
 * JSON 401/403 instead of redirecting, since API routes have no page to
 * redirect to. */
export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}
