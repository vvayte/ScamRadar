import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";
import { getOrCreateUserProfile, verifyMagicLink } from "@/lib/platformDataStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const rate = consumeRateLimit(getClientIp(req.headers), 2);
    if (!rate.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(rate.retryAfterSeconds));
      return response;
    }

    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || "").trim();
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    const verification = verifyMagicLink(token);
    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    const profile = getOrCreateUserProfile(verification.email);
    return NextResponse.json({
      ok: true,
      sessionToken: verification.sessionToken,
      profile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify magic link." }, { status: 500 });
  }
}
