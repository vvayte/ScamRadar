import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type HistoryRecord = {
  id: string;
  createdAt: string;
  input: string;
  score: number;
  level: "Low" | "Medium" | "High";
  reasons: string[];
  advice: string;
  hasImage: boolean;
};

export type UserCloudProfile = {
  email: string;
  premium: boolean;
  credits: number;
  count: number;
  history: HistoryRecord[];
  watchlist: string[];
  createdAt: string;
  updatedAt: string;
};

export type ThreatReport = {
  id: string;
  createdAt: string;
  indicatorType: "url" | "domain" | "seller" | "other";
  indicatorValue: string;
  platform: string;
  notes: string;
  reporterEmail?: string;
};

type StoreShape = {
  users: Record<string, UserCloudProfile>;
  reports: ThreatReport[];
};

type MagicTokenRecord = {
  email: string;
  expiresAt: number;
};

type SessionRecord = {
  email: string;
  expiresAt: number;
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "scamradar-store.json");
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const globalScope = globalThis as unknown as {
  __scamRadarStore?: StoreShape;
  __magicTokens?: Map<string, MagicTokenRecord>;
  __sessions?: Map<string, SessionRecord>;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function defaultStore(): StoreShape {
  return {
    users: {},
    reports: [],
  };
}

function loadStoreFromDisk(): StoreShape {
  try {
    if (!fs.existsSync(STORE_FILE)) return defaultStore();
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultStore();
    return {
      users: parsed.users || {},
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
    };
  } catch {
    return defaultStore();
  }
}

function getStore(): StoreShape {
  if (!globalScope.__scamRadarStore) {
    globalScope.__scamRadarStore = loadStoreFromDisk();
  }
  return globalScope.__scamRadarStore;
}

function persistStore(): void {
  const store = getStore();
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function getMagicTokenStore(): Map<string, MagicTokenRecord> {
  if (!globalScope.__magicTokens) {
    globalScope.__magicTokens = new Map();
  }
  return globalScope.__magicTokens;
}

function getSessionStore(): Map<string, SessionRecord> {
  if (!globalScope.__sessions) {
    globalScope.__sessions = new Map();
  }
  return globalScope.__sessions;
}

function pruneAuthStores(): void {
  const now = Date.now();
  const magicTokens = getMagicTokenStore();
  magicTokens.forEach((record, token) => {
    if (record.expiresAt < now) magicTokens.delete(token);
  });

  const sessions = getSessionStore();
  sessions.forEach((record, token) => {
    if (record.expiresAt < now) sessions.delete(token);
  });
}

function extractDomainFromValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).hostname.toLowerCase();
    }
    return new URL(`https://${trimmed}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function sanitizeWatchlist(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return Array.from(
    new Set(
      items
        .map((item) => String(item || "").trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 60)
    )
  );
}

function normalizeRiskLevel(value: unknown): HistoryRecord["level"] {
  const text = String(value || "").toLowerCase();
  if (text.includes("high")) return "High";
  if (text.includes("medium")) return "Medium";
  return "Low";
}

function sanitizeHistory(items: unknown): HistoryRecord[] {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, 150)
    .map((item: any): HistoryRecord => ({
      id: String(item?.id || crypto.randomUUID()),
      createdAt: String(item?.createdAt || nowIso()),
      input: String(item?.input || "").slice(0, 4000),
      score: Math.max(0, Math.min(100, Number(item?.score) || 0)),
      level: normalizeRiskLevel(item?.level),
      reasons: Array.isArray(item?.reasons)
        ? item.reasons.slice(0, 3).map((r: any) => String(r))
        : [],
      advice: String(item?.advice || "").slice(0, 500),
      hasImage: Boolean(item?.hasImage),
    }))
    .filter((item) => item.input || item.reasons.length > 0);
}

export function requestMagicLink(emailInput: string): { token: string; expiresAt: number } {
  pruneAuthStores();
  const email = normalizeEmail(emailInput);
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + MAGIC_LINK_TTL_MS;
  getMagicTokenStore().set(token, { email, expiresAt });
  return { token, expiresAt };
}

export function verifyMagicLink(token: string): { sessionToken: string; email: string } | null {
  pruneAuthStores();
  const record = getMagicTokenStore().get(token);
  if (!record || record.expiresAt < Date.now()) return null;

  getMagicTokenStore().delete(token);
  const sessionToken = crypto.randomBytes(32).toString("hex");
  getSessionStore().set(sessionToken, {
    email: record.email,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  return {
    sessionToken,
    email: record.email,
  };
}

export function getSessionEmail(sessionToken: string): string | null {
  pruneAuthStores();
  const session = getSessionStore().get(sessionToken);
  if (!session) return null;
  return session.email;
}

export function getOrCreateUserProfile(emailInput: string): UserCloudProfile {
  const email = normalizeEmail(emailInput);
  const store = getStore();
  const existing = store.users[email];
  if (existing) return existing;

  const created: UserCloudProfile = {
    email,
    premium: false,
    credits: 0,
    count: 0,
    history: [],
    watchlist: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store.users[email] = created;
  persistStore();
  return created;
}

export function syncUserProfile(
  emailInput: string,
  payload: Partial<Pick<UserCloudProfile, "premium" | "credits" | "count" | "history" | "watchlist">>
): UserCloudProfile {
  const profile = getOrCreateUserProfile(emailInput);
  profile.premium = Boolean(payload.premium ?? profile.premium);
  profile.credits = Math.max(0, Number(payload.credits ?? profile.credits) || 0);
  profile.count = Math.max(0, Number(payload.count ?? profile.count) || 0);
  profile.history = payload.history ? sanitizeHistory(payload.history) : profile.history;
  profile.watchlist = payload.watchlist ? sanitizeWatchlist(payload.watchlist) : profile.watchlist;
  profile.updatedAt = nowIso();
  persistStore();
  return profile;
}

export function submitThreatReport(input: {
  indicatorType?: string;
  indicatorValue: string;
  platform?: string;
  notes?: string;
  reporterEmail?: string;
}): ThreatReport {
  const indicatorType =
    input.indicatorType === "url" ||
    input.indicatorType === "domain" ||
    input.indicatorType === "seller"
      ? input.indicatorType
      : "other";

  const report: ThreatReport = {
    id: crypto.randomUUID(),
    createdAt: nowIso(),
    indicatorType,
    indicatorValue: String(input.indicatorValue || "").trim().slice(0, 400),
    platform: String(input.platform || "").trim().slice(0, 120),
    notes: String(input.notes || "").trim().slice(0, 1200),
    reporterEmail: input.reporterEmail ? normalizeEmail(input.reporterEmail) : undefined,
  };

  const store = getStore();
  store.reports.unshift(report);
  store.reports = store.reports.slice(0, 3000);
  persistStore();
  return report;
}

function getReportCountForDomain(domain: string): number {
  const normalizedDomain = domain.trim().toLowerCase();
  if (!normalizedDomain) return 0;

  const store = getStore();
  let total = 0;
  for (const report of store.reports) {
    const reportDomain = extractDomainFromValue(report.indicatorValue);
    if (!reportDomain) continue;
    if (reportDomain === normalizedDomain) total += 1;
  }
  return total;
}

export function getCommunityRiskHintsForUrls(urls: string[]): string[] {
  const domains = Array.from(
    new Set(
      urls
        .map((url) => extractDomainFromValue(url))
        .filter(Boolean)
    )
  );

  const hints: string[] = [];
  for (const domain of domains) {
    const count = getReportCountForDomain(domain);
    if (count > 0) {
      hints.push(`Community reports mention this domain (${domain}) ${count} time${count === 1 ? "" : "s"}`);
    }
  }

  return hints.slice(0, 3);
}

export function sendMagicLinkEmailIfConfigured(params: {
  email: string;
  magicLink: string;
}): Promise<{ delivered: boolean; provider: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !resendFrom) {
    return Promise.resolve({ delivered: false, provider: "none" });
  }

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [params.email],
      subject: "Your ScamRadar sign-in link",
      html: `<p>Use this secure sign-in link:</p><p><a href="${params.magicLink}">${params.magicLink}</a></p><p>This link expires in 15 minutes.</p>`,
    }),
  })
    .then(async (response) => {
      if (response.ok) return { delivered: true, provider: "resend" as const };
      const errText = await response.text();
      return { delivered: false, provider: "resend", error: errText.slice(0, 400) };
    })
    .catch((error) => ({
      delivered: false,
      provider: "resend",
      error: String(error),
    }));
}
