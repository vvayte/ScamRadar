import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "crypto";
import db from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/emailDelivery";
import {
  ANON_USAGE_COOKIE,
  ipHashFromRequest,
  mergeAnonymousIntoUser,
} from "@/lib/usage";

export const runtime = "nodejs";

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function shouldRequireEmailVerification(): boolean {
  return process.env.REQUIRE_EMAIL_VERIFICATION === "true";
}

function verificationEmailHtml(code: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h1 style="margin:0 0 12px;font-size:24px">Your ScamRadar verification code</h1>
      <p style="margin:0 0 16px">Enter this code to finish creating your account:</p>
      <div style="display:inline-block;padding:14px 18px;border-radius:12px;background:#ecfeff;color:#0e7490;font-size:28px;font-weight:800;letter-spacing:4px">${code}</div>
      <p style="margin:18px 0 0;color:#475569">This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
    </div>
  `;
}

function publicUser(user: {
  id: string;
  email: string;
  name: string | null;
  premium: boolean;
  credits: number;
  count?: number;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    premium: user.premium,
    credits: user.credits,
    count: user.count ?? 0,
  };
}

async function createSessionResponse(
  user: {
    id: string;
    email: string;
    name: string | null;
    premium: boolean;
    credits: number;
    count?: number;
  },
  options: { anonymousKey: string | null; ipHash: string }
) {
  // Merge anonymous device usage and IP-fingerprint usage into the new
  // account so a fresh signup cannot reset free-check allowance.
  await mergeAnonymousIntoUser({
    userId: user.id,
    anonymousKey: options.anonymousKey,
    ipHash: options.ipHash,
  });

  const refreshed = await db.user.findUnique({ where: { id: user.id } });
  const merged = refreshed || user;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId: user.id, expiresAt } });

  const res = NextResponse.json({ user: publicUser(merged) });
  res.cookies.set("sr_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  // Drop the anonymous cookie — its usage was just merged into the account.
  res.cookies.set(ANON_USAGE_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, confirmPassword, name, code } = (await req.json()) as {
      email?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
      code?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(emailNorm)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (typeof confirmPassword === "string" && confirmPassword !== password) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const ipHash = ipHashFromRequest(req);
    const anonymousKey = req.cookies.get(ANON_USAGE_COOKIE)?.value?.trim() || null;

    if (shouldRequireEmailVerification()) {
      const submittedCode = String(code || "").replace(/\D/g, "");

      if (submittedCode) {
        const pending = await db.emailVerificationCode.findUnique({ where: { email: emailNorm } });
        if (!pending || pending.expiresAt < new Date()) {
          if (pending) await db.emailVerificationCode.delete({ where: { email: emailNorm } }).catch(() => {});
          return NextResponse.json(
            { error: "Verification code expired. Request a new code.", requiresVerification: true },
            { status: 400 }
          );
        }

        if (pending.attempts >= MAX_CODE_ATTEMPTS) {
          await db.emailVerificationCode.delete({ where: { email: emailNorm } }).catch(() => {});
          return NextResponse.json(
            { error: "Too many incorrect attempts. Request a new code.", requiresVerification: true },
            { status: 429 }
          );
        }

        const codeValid = await bcrypt.compare(submittedCode, pending.codeHash);
        if (!codeValid) {
          await db.emailVerificationCode.update({
            where: { email: emailNorm },
            data: { attempts: { increment: 1 } },
          });
          return NextResponse.json(
            { error: "Incorrect verification code.", requiresVerification: true },
            { status: 400 }
          );
        }

        const user = await db.user.create({
          data: {
            email: emailNorm,
            passwordHash: pending.passwordHash,
            name: pending.name,
          },
        });
        await db.emailVerificationCode.delete({ where: { email: emailNorm } }).catch(() => {});
        return createSessionResponse(user, { anonymousKey, ipHash });
      }

      const verificationCode = randomInt(0, 1_000_000).toString().padStart(6, "0");
      const [passwordHash, codeHash] = await Promise.all([
        bcrypt.hash(password, 12),
        bcrypt.hash(verificationCode, 10),
      ]);

      await db.emailVerificationCode.upsert({
        where: { email: emailNorm },
        create: {
          email: emailNorm,
          passwordHash,
          codeHash,
          name: name?.trim() || null,
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        },
        update: {
          passwordHash,
          codeHash,
          name: name?.trim() || null,
          attempts: 0,
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        },
      });

      const delivery = await sendTransactionalEmail({
        to: emailNorm,
        subject: "Your ScamRadar verification code",
        html: verificationEmailHtml(verificationCode),
      });

      if (!delivery.delivered) {
        await db.emailVerificationCode.delete({ where: { email: emailNorm } }).catch(() => {});

        if (process.env.NODE_ENV !== "production") {
          return NextResponse.json({
            ok: true,
            requiresVerification: true,
            delivered: false,
            devCode: verificationCode,
            message: "Email delivery is not configured. Dev verification code returned.",
          });
        }

        return NextResponse.json(
          { error: "Email delivery is not configured yet. Please try again later." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        requiresVerification: true,
        delivered: true,
        expiresInSeconds: Math.floor(CODE_TTL_MS / 1000),
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        email: emailNorm,
        passwordHash,
        name: name?.trim() || null,
      },
    });

    return createSessionResponse(user, { anonymousKey, ipHash });
  } catch (err) {
    console.error("Register error", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
