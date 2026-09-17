import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = otpSchema.safeParse(body);
  const userId = body?.userId as string | undefined;

  if (!parsed.success || !userId) {
    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.otpCode || !user.otpExpiresAt) {
    return NextResponse.json({ error: "No pending verification for this account" }, { status: 400 });
  }

  if (user.otpExpiresAt < new Date()) {
    return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
  }

  if (user.otpCode !== parsed.data.code) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  await db.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date(), otpCode: null, otpExpiresAt: null },
  });

  return NextResponse.json({ verified: true });
}
