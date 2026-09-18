import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EMPLOYMENT_STATUSES } from "@/lib/constants";

const employmentStatusValues = EMPLOYMENT_STATUSES.map((e) => e.value) as [string, ...string[]];

const schema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  employmentStatus: z.enum(employmentStatusValues).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  employerName: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  monthlyIncome: z.number().nonnegative().optional(),
  yearsExperience: z.number().int().nonnegative().max(80).optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const update: Record<string, unknown> = {};
  if (data.firstName !== undefined) update.firstName = data.firstName;
  if (data.lastName !== undefined) update.lastName = data.lastName;
  if (data.phone !== undefined) update.phone = data.phone || null;
  if (data.employmentStatus !== undefined) update.employmentStatus = data.employmentStatus || null;
  if (data.jobTitle !== undefined) update.jobTitle = data.jobTitle || null;
  if (data.employerName !== undefined) update.employerName = data.employerName || null;
  if (data.industry !== undefined) update.industry = data.industry || null;
  if (data.monthlyIncome !== undefined) update.monthlyIncome = data.monthlyIncome;
  if (data.yearsExperience !== undefined) update.yearsExperience = data.yearsExperience;

  await db.user.update({ where: { id: session.user.id }, data: update });

  return NextResponse.json({ ok: true });
}
