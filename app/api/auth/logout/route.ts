import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("sr_session")?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sr_session", "", { maxAge: 0, path: "/" });
  return res;
}
