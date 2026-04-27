const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_POINTS = 24;

type Bucket = {
  windowStart: number;
  pointsUsed: number;
};

type GuardDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, Bucket>();

function readWindowMs(): number {
  const raw = Number(process.env.SCAMRADAR_RATE_WINDOW_MS || "");
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_WINDOW_MS;
  return Math.min(10 * 60_000, Math.max(10_000, Math.floor(raw)));
}

function readMaxPoints(): number {
  const raw = Number(process.env.SCAMRADAR_RATE_MAX_POINTS || "");
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_MAX_POINTS;
  return Math.min(200, Math.max(5, Math.floor(raw)));
}

function pruneExpiredBuckets(now: number, windowMs: number): void {
  buckets.forEach((bucket, key) => {
    if (now - bucket.windowStart > windowMs * 2) {
      buckets.delete(key);
    }
  });
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "unknown";
}

export function consumeRateLimit(clientIp: string, cost = 1): GuardDecision {
  const now = Date.now();
  const windowMs = readWindowMs();
  const maxPoints = readMaxPoints();
  const normalizedCost = Math.max(1, Math.min(10, Math.floor(cost)));
  const key = clientIp || "unknown";

  pruneExpiredBuckets(now, windowMs);

  const existing = buckets.get(key);
  if (!existing || now - existing.windowStart >= windowMs) {
    const used = Math.min(maxPoints, normalizedCost);
    buckets.set(key, { windowStart: now, pointsUsed: used });
    return {
      allowed: true,
      remaining: Math.max(0, maxPoints - used),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.pointsUsed + normalizedCost > maxPoints) {
    const retryAfterMs = windowMs - (now - existing.windowStart);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  existing.pointsUsed += normalizedCost;
  buckets.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, maxPoints - existing.pointsUsed),
    retryAfterSeconds: Math.ceil(windowMs / 1000),
  };
}

export function __resetRateLimitStoreForTests(): void {
  buckets.clear();
}
