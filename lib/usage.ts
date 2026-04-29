import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const FREE_CHECK_LIMIT = 2;
export const ANON_USAGE_COOKIE = "sr_anon";

type UsageUser = {
  id: string;
  email: string;
  premium: boolean;
  credits: number;
  count: number;
};

type AnonymousUsage = {
  key: string;
  premium: boolean;
  credits: number;
  count: number;
};

export type UsageSubject =
  | { kind: "user"; user: UsageUser; anonymousKey?: never; setAnonymousCookie?: false }
  | { kind: "anonymous"; anonymous: AnonymousUsage; anonymousKey: string; setAnonymousCookie: boolean };

export type UsageSnapshot = {
  authenticated: boolean;
  premium: boolean;
  credits: number;
  count: number;
  freeLimit: number;
};

export type StoredCheckResult = {
  score: number;
  level: string;
  reasons: string[];
  advice: string;
};

function createAnonymousKey(): string {
  return randomBytes(24).toString("hex");
}

export function usageSnapshot(subject: UsageSubject): UsageSnapshot {
  const source = subject.kind === "user" ? subject.user : subject.anonymous;
  return {
    authenticated: subject.kind === "user",
    premium: source.premium,
    credits: source.credits,
    count: source.count,
    freeLimit: FREE_CHECK_LIMIT,
  };
}

export function canRunCheck(subject: UsageSubject): boolean {
  const usage = usageSnapshot(subject);
  return usage.premium || usage.credits > 0 || usage.count < FREE_CHECK_LIMIT;
}

export async function getSessionUser(req: NextRequest): Promise<UsageUser | null> {
  const token = req.cookies.get("sr_session")?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    premium: session.user.premium,
    credits: session.user.credits,
    count: session.user.count,
  };
}

export async function resolveUsageSubject(req: NextRequest): Promise<UsageSubject> {
  const user = await getSessionUser(req);
  if (user) return { kind: "user", user };

  const existingKey = req.cookies.get(ANON_USAGE_COOKIE)?.value?.trim();
  const key = existingKey || createAnonymousKey();
  const anonymous = await db.anonymousUsage.upsert({
    where: { key },
    create: { key },
    update: {},
  });

  return {
    kind: "anonymous",
    anonymous: {
      key: anonymous.key,
      premium: anonymous.premium,
      credits: anonymous.credits,
      count: anonymous.count,
    },
    anonymousKey: key,
    setAnonymousCookie: !existingKey,
  };
}

export function attachAnonymousCookie(response: NextResponse, subject: UsageSubject): NextResponse {
  if (subject.kind === "anonymous" && subject.setAnonymousCookie) {
    response.cookies.set(ANON_USAGE_COOKIE, subject.anonymousKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
  }
  return response;
}

export async function applySuccessfulCheck(params: {
  subject: UsageSubject;
  input: string;
  result: StoredCheckResult;
  hasImage: boolean;
}): Promise<UsageSnapshot> {
  const { subject, input, result, hasImage } = params;

  if (subject.kind === "user") {
    const next = await db.$transaction(async (tx) => {
      const latest = await tx.user.findUnique({ where: { id: subject.user.id } });
      if (!latest) throw new Error("User not found.");

      const data: { credits?: { decrement: number }; count?: { increment: number } } = {};
      if (!latest.premium) {
        if (latest.credits > 0) data.credits = { decrement: 1 };
        else data.count = { increment: 1 };
      }

      const updated = await tx.user.update({
        where: { id: latest.id },
        data,
      });

      await tx.historyItem.create({
        data: {
          userId: latest.id,
          input: input.slice(0, 12_000),
          score: Math.max(0, Math.min(100, Number(result.score) || 0)),
          level: String(result.level || "Low").slice(0, 32),
          reasons: JSON.stringify((result.reasons || []).slice(0, 3).map(String)),
          advice: String(result.advice || "").slice(0, 2000),
          hasImage,
        },
      });

      return updated;
    });

    return {
      authenticated: true,
      premium: next.premium,
      credits: next.credits,
      count: next.count,
      freeLimit: FREE_CHECK_LIMIT,
    };
  }

  const latest = await db.anonymousUsage.findUnique({ where: { key: subject.anonymousKey } });
  if (!latest) throw new Error("Anonymous usage not found.");

  const data: { credits?: { decrement: number }; count?: { increment: number } } = {};
  if (!latest.premium) {
    if (latest.credits > 0) data.credits = { decrement: 1 };
    else data.count = { increment: 1 };
  }

  const updated = await db.anonymousUsage.update({
    where: { key: subject.anonymousKey },
    data,
  });

  return {
    authenticated: false,
    premium: updated.premium,
    credits: updated.credits,
    count: updated.count,
    freeLimit: FREE_CHECK_LIMIT,
  };
}
