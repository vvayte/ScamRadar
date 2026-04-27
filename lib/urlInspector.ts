import { lookup } from "node:dns/promises";
import net from "node:net";
import { inspectMarketplaceListing } from "@/lib/marketplaceInspector";

export type UrlInspectionResult = {
  urls: string[];
  extractedText: string;
  riskHints: string[];
  fetchErrors: string[];
};

type UrlInspectionCacheValue = {
  expiresAt: number;
  textBlock: string;
  riskHints: string[];
  fetchError: string | null;
};

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;
const FETCH_TIMEOUT_MS = 7000;
const MAX_URLS_TO_INSPECT = 3;
const MAX_EXTRACTED_TEXT_LENGTH = 6500;
const MAX_RESPONSE_BYTES = 2_500_000;
const MAX_HTML_CHARACTERS = 120_000;
const URL_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_RECORDS = 500;

const urlInspectionCache = new Map<string, UrlInspectionCacheValue>();

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function trimTrailingPunctuation(url: string): string {
  return url.replace(/[),.!?;:]+$/g, "");
}

function normalizeCacheKey(rawUrl: string): string {
  return rawUrl.trim().toLowerCase();
}

function getFromCache(rawUrl: string): UrlInspectionCacheValue | null {
  const key = normalizeCacheKey(rawUrl);
  const cached = urlInspectionCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    urlInspectionCache.delete(key);
    return null;
  }

  return cached;
}

function setCache(rawUrl: string, value: Omit<UrlInspectionCacheValue, "expiresAt">): void {
  if (urlInspectionCache.size > MAX_CACHE_RECORDS) {
    const oldestKey = urlInspectionCache.keys().next().value;
    if (oldestKey) urlInspectionCache.delete(oldestKey);
  }

  urlInspectionCache.set(normalizeCacheKey(rawUrl), {
    ...value,
    expiresAt: Date.now() + URL_CACHE_TTL_MS,
  });
}

function extractUrls(input: string): string[] {
  const matches = input.match(URL_REGEX) ?? [];
  const cleaned = matches.map(trimTrailingPunctuation).filter(Boolean);
  return dedupe(cleaned).slice(0, MAX_URLS_TO_INSPECT);
}

function parseIPv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;

  const octets = parts.map((value) => Number(value));
  if (octets.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return null;
  }

  return octets;
}

function isPrivateIp(address: string): boolean {
  const ipVersion = net.isIP(address);
  if (!ipVersion) return false;

  if (ipVersion === 4) {
    const octets = parseIPv4(address);
    if (!octets) return true;

    const [a, b] = octets;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    return false;
  }

  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  );
}

async function assertSafeUrl(urlString: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error("Invalid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http/https URLs are supported");
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs with embedded credentials are blocked");
  }

  if (parsed.port && !["80", "443"].includes(parsed.port)) {
    throw new Error("URL port is not allowed");
  }

  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Private hostname is blocked");
  }

  if (isPrivateIp(parsed.hostname)) {
    throw new Error("Private IP target is blocked");
  }

  try {
    const addresses = await lookup(parsed.hostname, { all: true, verbatim: true });
    if (!addresses.length) {
      throw new Error("Host did not resolve");
    }

    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        throw new Error("Resolved private IP target is blocked");
      }
    }
  } catch (error) {
    throw new Error(`Host resolution failed: ${(error as Error).message}`);
  }

  return parsed;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extractMetaTag(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]*name=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${key}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]*property=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${key}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]).trim();
  }

  return "";
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return "";
  return decodeEntities(match[1]).replace(/\s+/g, " ").trim();
}

function stripHtmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  return decodeEntities(
    withoutScripts
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function collectRiskHints(initialUrl: string, finalUrl: string, bodyText: string): string[] {
  const hints: string[] = [];

  const initial = new URL(initialUrl);
  const resolved = new URL(finalUrl);

  if (initial.hostname !== resolved.hostname) {
    hints.push("URL redirects to a different domain");
  }

  if (resolved.hostname.includes("xn--")) {
    hints.push("Domain uses punycode lookalike pattern");
  }

  if (/\b(telegram|whatsapp|signal|discord)\b/i.test(bodyText)) {
    hints.push("Listing asks to move conversation off-platform");
  }

  if (/\b(wire transfer|bank transfer|gift card|bitcoin|crypto|usdt|western union)\b/i.test(bodyText)) {
    hints.push("Listing suggests high-risk payment methods");
  }

  if (/\b(act now|limited time|urgent|only today|final notice)\b/i.test(bodyText)) {
    hints.push("Listing uses urgency pressure language");
  }

  if (/\b(verify account|confirm details|send id|passport)\b/i.test(bodyText)) {
    hints.push("Listing requests sensitive personal details");
  }

  return dedupe(hints).slice(0, 4);
}

function summarizePage(initialUrl: string, finalUrl: string, html: string): { textBlock: string; riskHints: string[] } {
  const title = extractTitle(html);
  const description =
    extractMetaTag(html, "description") || extractMetaTag(html, "og:description");
  const ogTitle = extractMetaTag(html, "og:title");
  const strippedText = stripHtmlToText(html);
  const snippet = strippedText.slice(0, 2600);
  const marketplace = inspectMarketplaceListing(finalUrl, html, `${title}\n${description}\n${snippet}`);

  const lines = [
    `[Source URL] ${finalUrl}`,
    title ? `[Page Title] ${title}` : "",
    ogTitle ? `[Open Graph Title] ${ogTitle}` : "",
    description ? `[Description] ${description}` : "",
    marketplace.details.length ? marketplace.details.join("\n") : "",
    snippet ? `[Content Snippet] ${snippet}` : "",
  ].filter(Boolean);

  return {
    textBlock: lines.join("\n"),
    riskHints: dedupe([
      ...collectRiskHints(initialUrl, finalUrl, `${title}\n${description}\n${snippet}`),
      ...marketplace.riskHints,
    ]).slice(0, 5),
  };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "ScamRadar/1.0 URL Analyzer",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function inspectSingleUrl(urlString: string): Promise<{ textBlock: string; riskHints: string[]; fetchError: string | null }> {
  const cached = getFromCache(urlString);
  if (cached) {
    return {
      textBlock: cached.textBlock,
      riskHints: cached.riskHints,
      fetchError: cached.fetchError,
    };
  }

  let result: { textBlock: string; riskHints: string[]; fetchError: string | null };

  try {
    const safeUrl = await assertSafeUrl(urlString);
    const response = await fetchWithTimeout(safeUrl.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error(`Unsupported content-type: ${contentType || "unknown"}`);
    }

    const contentLength = Number(response.headers.get("content-length") || "0");
    if (contentLength && contentLength > MAX_RESPONSE_BYTES) {
      throw new Error("Response is too large");
    }

    const html = (await response.text()).slice(0, MAX_HTML_CHARACTERS);
    const finalUrl = response.url || safeUrl.toString();
    const summary = summarizePage(safeUrl.toString(), finalUrl, html);

    result = {
      textBlock: summary.textBlock,
      riskHints: summary.riskHints,
      fetchError: null,
    };
  } catch (error) {
    result = {
      textBlock: "",
      riskHints: [],
      fetchError: `Could not inspect ${urlString}: ${(error as Error).message || "Unknown fetch error"}`,
    };
  }

  setCache(urlString, result);
  return result;
}

export async function inspectListingUrlsFromText(input: string): Promise<UrlInspectionResult> {
  const urls = extractUrls(input);
  if (!urls.length) {
    return {
      urls: [],
      extractedText: "",
      riskHints: [],
      fetchErrors: [],
    };
  }

  const inspections = await Promise.all(urls.map((url) => inspectSingleUrl(url)));
  const textBlocks = inspections.map((item) => item.textBlock).filter(Boolean);
  const riskHints = inspections.flatMap((item) => item.riskHints);
  const fetchErrors = inspections.map((item) => item.fetchError).filter(Boolean) as string[];

  return {
    urls,
    extractedText: textBlocks.join("\n\n").slice(0, MAX_EXTRACTED_TEXT_LENGTH),
    riskHints: dedupe(riskHints).slice(0, 5),
    fetchErrors,
  };
}
