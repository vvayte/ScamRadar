import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const rate = consumeRateLimit(getClientIp(req.headers), 1);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    await db.newsletterSignup.upsert({
      where: { email },
      create: { email },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json({ error: "Could not subscribe right now." }, { status: 500 });
  }
}
