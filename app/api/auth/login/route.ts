import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.session.create({ data: { token, userId: user.id, expiresAt } });

    // clean up old sessions
    await db.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, premium: user.premium, credits: user.credits, count: user.count },
    });
    res.cookies.set("sr_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
