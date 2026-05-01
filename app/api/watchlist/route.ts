import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";

export const runtime = "nodejs";

async function getSessionUser(req: NextRequest) {
  const token = req.cookies.get("sr_session")?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

function normalizeValue(raw: unknown): string {
  return String(raw || "").trim().toLowerCase().slice(0, 200);
}

export async function POST(req: NextRequest) {
  const rate = consumeRateLimit(getClientIp(req.headers), 1);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const value = normalizeValue(body?.value);
  if (!value) return NextResponse.json({ error: "Value is required." }, { status: 400 });

  const existingCount = await db.watchlistItem.count({ where: { userId: user.id } });
  if (existingCount >= 50) {
    return NextResponse.json({ error: "Watchlist limit reached (50)." }, { status: 409 });
  }

  await db.watchlistItem.upsert({
    where: { userId_value: { userId: user.id, value } },
    create: { userId: user.id, value },
    update: {},
  });

  const items = await db.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ ok: true, watchlist: items.map((item) => item.value) });
}

export async function DELETE(req: NextRequest) {
  const rate = consumeRateLimit(getClientIp(req.headers), 1);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const value = normalizeValue(body?.value);
  if (!value) return NextResponse.json({ error: "Value is required." }, { status: 400 });

  await db.watchlistItem.deleteMany({ where: { userId: user.id, value } });

  const items = await db.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ ok: true, watchlist: items.map((item) => item.value) });
}
