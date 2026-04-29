import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";

export const runtime = "nodejs";

type SyncHistoryItem = {
  id?: unknown;
  createdAt?: unknown;
  input?: unknown;
  score?: unknown;
  level?: unknown;
  reasons?: unknown;
  advice?: unknown;
  hasImage?: unknown;
};

function parseReasons(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String).slice(0, 3) : [];
  } catch {
    return [];
  }
}

function normalizeHistory(items: unknown): Array<{
  id: string;
  createdAt: Date;
  input: string;
  score: number;
  level: string;
  reasons: string;
  advice: string;
  hasImage: boolean;
}> {
  if (!Array.isArray(items)) return [];

  return items.slice(0, 20).map((raw) => {
    const item = raw as SyncHistoryItem;
    const createdAt = new Date(String(item.createdAt || new Date().toISOString()));
    const reasons = Array.isArray(item.reasons) ? item.reasons.slice(0, 3).map(String) : [];

    return {
      id: String(item.id || crypto.randomUUID()),
      createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      input: String(item.input || "").slice(0, 12_000),
      score: Math.max(0, Math.min(100, Number(item.score) || 0)),
      level: String(item.level || "Low").slice(0, 32),
      reasons: JSON.stringify(reasons),
      advice: String(item.advice || "").slice(0, 2000),
      hasImage: Boolean(item.hasImage),
    };
  });
}

function normalizeWatchlist(items: unknown): string[] {
  if (!Array.isArray(items)) return [];

  return Array.from(
    new Set(
      items
        .map((item) => String(item || "").trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 50);
}

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

export async function POST(req: NextRequest) {
  try {
    const rate = consumeRateLimit(getClientIp(req.headers), 2);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const history = normalizeHistory(body?.history);
    const watchlist = normalizeWatchlist(body?.watchlist);

    await db.$transaction(async (tx) => {
      await tx.historyItem.deleteMany({ where: { userId: user.id } });
      if (history.length > 0) {
        await tx.historyItem.createMany({
          data: history.map((item) => ({ ...item, userId: user.id })),
      });
      }

      await tx.watchlistItem.deleteMany({ where: { userId: user.id } });
      if (watchlist.length > 0) {
        await tx.watchlistItem.createMany({
          data: watchlist.map((value) => ({ userId: user.id, value })),
          skipDuplicates: true,
        });
      }
    });

    const refreshed = await db.user.findUnique({
      where: { id: user.id },
      include: {
        history: { orderBy: { createdAt: "desc" }, take: 20 },
        watchlist: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    return NextResponse.json({
      ok: true,
      user: refreshed
        ? {
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
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to sync account." }, { status: 500 });
  }
}
