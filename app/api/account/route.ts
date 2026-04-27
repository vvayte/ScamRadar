import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";
import {
  getOrCreateUserProfile,
  getSessionEmail,
  syncUserProfile,
} from "@/lib/platformDataStore";

export const runtime = "nodejs";

function readBearerToken(headers: Headers): string {
  const authHeader = headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return "";
  return authHeader.slice(7).trim();
}

export async function GET(req: NextRequest) {
  try {
    const rate = consumeRateLimit(getClientIp(req.headers), 1);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const token = readBearerToken(req.headers);
    const email = getSessionEmail(token);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const profile = getOrCreateUserProfile(email);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load account." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = consumeRateLimit(getClientIp(req.headers), 2);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const token = readBearerToken(req.headers);
    const email = getSessionEmail(token);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const profile = syncUserProfile(email, {
      premium: body?.premium,
      credits: body?.credits,
      count: body?.count,
      history: body?.history,
      watchlist: body?.watchlist,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to sync account." }, { status: 500 });
  }
}
