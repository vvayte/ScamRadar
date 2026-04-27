import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";
import { requestMagicLink, sendMagicLinkEmailIfConfigured } from "@/lib/platformDataStore";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const email = String(body?.email || "").trim().toLowerCase();
    const origin =
      String(body?.origin || "").trim() ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const { token, expiresAt } = requestMagicLink(email);
    const magicLink = `${origin.replace(/\/$/, "")}/?magic_token=${token}`;
    const delivery = await sendMagicLinkEmailIfConfigured({ email, magicLink });

    return NextResponse.json({
      ok: true,
      expiresAt,
      delivered: delivery.delivered,
      provider: delivery.provider,
      // In dev/no-email mode we surface the link so flow can still work.
      magicLink: delivery.delivered ? null : magicLink,
      deliveryError: delivery.error || null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to request magic link." }, { status: 500 });
  }
}
