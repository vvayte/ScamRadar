import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sr_session")?.value;
  if (!token) return NextResponse.json({ user: null });

  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          history: { orderBy: { createdAt: "desc" }, take: 20 },
          watchlist: { orderBy: { createdAt: "desc" }, take: 50 },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    const res = NextResponse.json({ user: null });
    res.cookies.set("sr_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  const { user } = session;
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      premium: user.premium,
      credits: user.credits,
      count: user.count,
      history: user.history.map((h) => ({
        id: h.id,
        createdAt: h.createdAt,
        input: h.input,
        score: h.score,
        level: h.level,
        reasons: JSON.parse(h.reasons || "[]"),
        advice: h.advice,
        hasImage: h.hasImage,
      })),
      watchlist: user.watchlist.map((w) => w.value),
    },
  });
}
