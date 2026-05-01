import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getClientIp } from "@/lib/requestGuard";

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
  | { kind: "user"; user: UsageUser; ipHash: string; anonymousKey?: never; setAnonymousCookie?: false }
  | { kind: "anonymous"; anonymous: AnonymousUsage; anonymousKey: string; setAnonymousCookie: boolean; ipHash: string };

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

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "scamradar-ip";
  return createHash("sha256").update(`${salt}:${ip || "unknown"}`).digest("hex");
}

export function ipHashFromRequest(req: NextRequest): string {
  return hashIp(getClientIp(req.headers));
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

/**
 * Server-side enforcement: a check is allowed only when the user is premium,
 * holds paid credits, OR all of (account, anonymous cookie, IP fingerprint)
 * still have free checks remaining. Taking the MAX across these counters
 * prevents reset-by-cookie-clear and reset-by-new-account abuse.
 */
export async function canRunCheckStrict(
  subject: UsageSubject
): Promise<{ allowed: boolean; effectiveCount: number }> {
  const usage = usageSnapshot(subject);
  if (usage.premium || usage.credits > 0) {
    return { allowed: true, effectiveCount: usage.count };
  }

  const ipUsage = await db.ipFreeUsage.findUnique({ where: { ipHash: subject.ipHash } });
  const ipCount = ipUsage?.count ?? 0;
  const effectiveCount = Math.max(usage.count, ipCount);
  return { allowed: effectiveCount < FREE_CHECK_LIMIT, effectiveCount };
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
  const ipHash = ipHashFromRequest(req);
  const user = await getSessionUser(req);
  if (user) return { kind: "user", user, ipHash };

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
    ipHash,
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

/**
 * After a successful check, increment usage on the user/anonymous record
 * AND on the IP fingerprint. The IP counter is the cross-account guard.
 */
export async function applySuccessfulCheck(params: {
  subject: UsageSubject;
  input: string;
  result: StoredCheckResult;
  hasImage: boolean;
}): Promise<UsageSnapshot> {
  const { subject, input, result, hasImage } = params;

  const incrementIpUsage = async (isFreeUse: boolean) => {
    if (!isFreeUse) return;
    await db.ipFreeUsage.upsert({
      where: { ipHash: subject.ipHash },
      create: { ipHash: subject.ipHash, count: 1 },
      update: { count: { increment: 1 } },
    });
  };

  if (subject.kind === "user") {
    const next = await db.$transaction(async (tx) => {
      const latest = await tx.user.findUnique({ where: { id: subject.user.id } });
      if (!latest) throw new Error("User not found.");

      const data: { credits?: { decrement: number }; count?: { increment: number } } = {};
      let isFreeUse = false;
      if (!latest.premium) {
        if (latest.credits > 0) data.credits = { decrement: 1 };
        else {
          data.count = { increment: 1 };
          isFreeUse = true;
        }
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

      return { updated, isFreeUse };
    });

    await incrementIpUsage(next.isFreeUse);

    return {
      authenticated: true,
      premium: next.updated.premium,
      credits: next.updated.credits,
      count: next.updated.count,
      freeLimit: FREE_CHECK_LIMIT,
    };
  }

  const latest = await db.anonymousUsage.findUnique({ where: { key: subject.anonymousKey } });
  if (!latest) throw new Error("Anonymous usage not found.");

  const data: { credits?: { decrement: number }; count?: { increment: number } } = {};
  let isFreeUse = false;
  if (!latest.premium) {
    if (latest.credits > 0) data.credits = { decrement: 1 };
    else {
      data.count = { increment: 1 };
      isFreeUse = true;
    }
  }

  const updated = await db.anonymousUsage.update({
    where: { key: subject.anonymousKey },
    data,
  });

  await incrementIpUsage(isFreeUse);

  return {
    authenticated: false,
    premium: updated.premium,
    credits: updated.credits,
    count: updated.count,
    freeLimit: FREE_CHECK_LIMIT,
  };
}

/**
 * Called from /signup and /login — pulls free-check usage and any paid credits
 * from the anonymous record (cookie) AND the IP fingerprint into the user's
 * account so that creating a new account does not grant a fresh allowance.
 *
 * The merged anonymous record is reset to zero so the cookie cannot be reused.
 * The user's own count starts from MAX(existing user count, anonymous count,
 * ip count) so that even cookie-clearing users hit the same wall.
 */
export async function mergeAnonymousIntoUser(params: {
  userId: string;
  anonymousKey: string | null;
  ipHash: string;
}): Promise<void> {
  const { userId, anonymousKey, ipHash } = params;

  await db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;

    let anonymousCount = 0;
    let anonymousCredits = 0;
    let anonymousPremium = false;

    if (anonymousKey) {
      const anon = await tx.anonymousUsage.findUnique({ where: { key: anonymousKey } });
      if (anon) {
        anonymousCount = anon.count;
        anonymousCredits = anon.credits;
        anonymousPremium = anon.premium;
        await tx.anonymousUsage.update({
          where: { key: anonymousKey },
          data: { count: 0, credits: 0, premium: false, subscriptionStatus: null },
        });
      }
    }

    const ipUsage = await tx.ipFreeUsage.findUnique({ where: { ipHash } });
    const ipCount = ipUsage?.count ?? 0;

    const mergedCount = Math.max(user.count, anonymousCount, ipCount);
    const mergedCredits = user.credits + anonymousCredits;
    const mergedPremium = user.premium || anonymousPremium;

    await tx.user.update({
      where: { id: userId },
      data: {
        count: mergedCount,
        credits: mergedCredits,
        premium: mergedPremium,
        mergedAnonymousKey: anonymousKey || user.mergedAnonymousKey,
        signupIpHash: user.signupIpHash || ipHash,
      },
    });
  });
}
