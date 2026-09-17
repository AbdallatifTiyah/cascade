import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validation/auth";
import { recordAudit, trackEvent } from "@/lib/audit";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otpCode = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone || null,
      passwordHash,
      otpCode,
      otpExpiresAt,
    },
  });

  await recordAudit({ actorId: user.id, action: "USER_SIGNED_UP", entityType: "User", entityId: user.id });
  await trackEvent({ userId: user.id, name: "onboarding_started" });

  // No SMS/email provider is configured for this demo, so the verification
  // code is returned directly to the client and shown on-screen instead of
  // being delivered out-of-band. Swap for a real provider by sending
  // otpCode via that provider here and dropping it from the response.
  return NextResponse.json({ userId: user.id, demoOtp: otpCode });
}
