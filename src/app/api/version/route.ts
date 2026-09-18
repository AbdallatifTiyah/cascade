import { NextResponse } from "next/server";
import { BUILD_VERSION } from "@/lib/build-version";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ version: BUILD_VERSION }, { headers: { "Cache-Control": "no-store" } });
}
