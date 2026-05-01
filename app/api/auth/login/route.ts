import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import db from "@/lib/db";
import {
  ANON_USAGE_COOKIE,
  ipHashFromRequest,
  mergeAnonymousIntoUser,
} from "@/lib/usage";

export const runtime = "nodejs";

function parseReasons(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String).slice(0, 3) : [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Merge any anonymous device usage and IP-fingerprint usage into this
    // account on every login. This keeps free-check enforcement consistent
    // across "log out → new account" and "different device" flows.
    const anonymousKey = req.cookies.get(ANON_USAGE_COOKIE)?.value?.trim() || null;
    const ipHash = ipHashFromRequest(req);
    await mergeAnonymousIntoUser({ userId: user.id, anonymousKey, ipHash });

    const refreshed = await db.user.findUnique({
      where: { id: user.id },
      include: {
        history: { orderBy: { createdAt: "desc" }, take: 20 },
        watchlist: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!refreshed) {
      return NextResponse.json({ error: "Account unavailable." }, { status: 500 });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.session.create({ data: { token, userId: refreshed.id, expiresAt } });

    // clean up old sessions
    await db.session.deleteMany({ where: { userId: refreshed.id, expiresAt: { lt: new Date() } } });

    const res = NextResponse.json({
      user: {
        id: refreshed.id,
        email: refreshed.email,
        name: refreshed.name,
        premium: refreshed.premium,
        credits: refreshed.credits,
        count: refreshed.count,
        history: refreshed.history.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          input: item.input,
          score: item.score,
          level: item.level,
          reasons: parseReasons(item.reasons),
          advice: item.advice,
          hasImage: item.hasImage,
        })),
        watchlist: refreshed.watchlist.map((item) => item.value),
      },
    });
    res.cookies.set("sr_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });
    res.cookies.set(ANON_USAGE_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
