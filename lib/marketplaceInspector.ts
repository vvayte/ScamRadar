type MarketplaceMatch = {
  id: string;
  name: string;
  hostPatterns: RegExp[];
};

export type MarketplaceInspection = {
  platformId: string;
  platformName: string;
  isKnownMarketplace: boolean;
  details: string[];
  riskHints: string[];
};

const KNOWN_MARKETPLACES: MarketplaceMatch[] = [
  {
    id: "avito",
    name: "Avito",
    hostPatterns: [/(\.|^)avito\.ru$/i],
  },
  {
    id: "ebay",
    name: "eBay",
    hostPatterns: [/(\.|^)ebay\.[a-z.]+$/i],
  },
  {
    id: "facebook_marketplace",
    name: "Facebook Marketplace",
    hostPatterns: [/(\.|^)facebook\.com$/i, /(\.|^)m\.facebook\.com$/i],
  },
  {
    id: "craigslist",
    name: "Craigslist",
    hostPatterns: [/(\.|^)craigslist\.org$/i],
  },
  {
    id: "offerup",
    name: "OfferUp",
    hostPatterns: [/(\.|^)offerup\.com$/i],
  },
  {
    id: "mercari",
    name: "Mercari",
    hostPatterns: [/(\.|^)mercari\.com$/i],
  },
  {
    id: "olx",
    name: "OLX",
    hostPatterns: [/(\.|^)olx\.[a-z.]+$/i],
  },
  {
    id: "gumtree",
    name: "Gumtree",
    hostPatterns: [/(\.|^)gumtree\.[a-z.]+$/i],
  },
  {
    id: "wallapop",
    name: "Wallapop",
    hostPatterns: [/(\.|^)wallapop\.com$/i],
  },
  {
    id: "vinted",
    name: "Vinted",
    hostPatterns: [/(\.|^)vinted\.[a-z.]+$/i],
  },
];

const BRAND_MISMATCH_CHECKS = [
  { label: "eBay", pattern: /\bebay\b/i, trustedHost: /(\.|^)ebay\./i },
  { label: "Facebook Marketplace", pattern: /facebook marketplace/i, trustedHost: /facebook\.com$/i },
  { label: "Avito", pattern: /\bavito\b/i, trustedHost: /(\.|^)avito\.ru$/i },
  { label: "Craigslist", pattern: /\bcraigslist\b/i, trustedHost: /(\.|^)craigslist\.org$/i },
];

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
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

function extractPrice(combinedText: string, html: string): string {
  const directMetaPrice =
    extractMetaTag(html, "product:price:amount") || extractMetaTag(html, "og:price:amount");
  if (directMetaPrice) return directMetaPrice;

  const pattern =
    /(?:\$|€|£|₽|₹|AED|USD|EUR|GBP|RUB)\s?[0-9]{1,3}(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/i;
  const match = combinedText.match(pattern);
  return match?.[0]?.trim() || "";
}

function extractLikelyField(combinedText: string, label: string): string {
  const pattern = new RegExp(`${label}\\s*[:\\-]\\s*([^\\n\\r]{2,90})`, "i");
  const match = combinedText.match(pattern);
  return match?.[1]?.trim() || "";
}

function parseJsonLdBlocks(html: string): any[] {
  const blocks: any[] = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      blocks.push(parsed);
    } catch {
      continue;
    }
  }

  return blocks;
}

function findMarketplace(hostname: string): MarketplaceMatch | null {
  for (const marketplace of KNOWN_MARKETPLACES) {
    if (marketplace.hostPatterns.some((pattern) => pattern.test(hostname))) {
      return marketplace;
    }
  }
  return null;
}

function gatherMarketplaceDetails(
  platformName: string,
  combinedText: string,
  html: string
): string[] {
  const details: string[] = [];

  details.push(`[Marketplace Platform] ${platformName}`);

  const price = extractPrice(combinedText, html);
  if (price) {
    details.push(`[Marketplace Price] ${price}`);
  }

  const location = extractLikelyField(combinedText, "location") || extractLikelyField(combinedText, "city");
  if (location) {
    details.push(`[Marketplace Location] ${location}`);
  }

  const seller =
    extractLikelyField(combinedText, "seller") ||
    extractLikelyField(combinedText, "posted by") ||
    extractLikelyField(combinedText, "vendor");
  if (seller) {
    details.push(`[Marketplace Seller] ${seller}`);
  }

  const jsonLdBlocks = parseJsonLdBlocks(html);
  for (const block of jsonLdBlocks) {
    const offers = block?.offers || (Array.isArray(block) ? block[0]?.offers : null);
    const condition = block?.itemCondition || offers?.itemCondition;
    if (typeof condition === "string") {
      details.push(`[Marketplace Condition] ${condition}`);
      break;
    }
  }

  return dedupe(details).slice(0, 5);
}

function gatherMarketplaceRiskHints(
  hostname: string,
  combinedText: string,
  isKnownMarketplace: boolean
): string[] {
  const hints: string[] = [];

  if (
    /\b(whatsapp|telegram|signal|discord|gmail\.com|protonmail|private chat)\b/i.test(combinedText)
  ) {
    hints.push("Listing asks to continue communication off-platform");
  }

  if (
    /\b(bank transfer|wire transfer|gift card|crypto only|bitcoin only|paypal friends and family)\b/i.test(
      combinedText
    )
  ) {
    hints.push("Listing requests payment methods with weak buyer protection");
  }

  if (/\b(deposit now|booking fee|reservation fee|hold item with transfer)\b/i.test(combinedText)) {
    hints.push("Listing asks for a prepayment/deposit before secure checkout");
  }

  if (/\b(shipper agent|courier fee|insurance release fee)\b/i.test(combinedText)) {
    hints.push("Listing includes suspicious extra payment fees");
  }

  if (isKnownMarketplace && /\b(pay outside|outside the platform|avoid platform fees)\b/i.test(combinedText)) {
    hints.push("Seller attempts to bypass platform payment safeguards");
  }

  for (const check of BRAND_MISMATCH_CHECKS) {
    if (check.pattern.test(combinedText) && !check.trustedHost.test(hostname)) {
      hints.push(`Possible fake ${check.label} clone domain`);
    }
  }

  return dedupe(hints).slice(0, 4);
}

export function inspectMarketplaceListing(url: string, html: string, textSnippet: string): MarketplaceInspection {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase();
  const marketplace = findMarketplace(hostname);
  const combinedText = [textSnippet, html.slice(0, 12000)].join("\n");

  const platformName = marketplace?.name || "Generic listing page";
  const platformId = marketplace?.id || "generic";
  const isKnownMarketplace = Boolean(marketplace);

  const details = isKnownMarketplace
    ? gatherMarketplaceDetails(platformName, combinedText, html)
    : [];
  const riskHints = gatherMarketplaceRiskHints(hostname, combinedText, isKnownMarketplace);

  return {
    platformId,
    platformName,
    isKnownMarketplace,
    details,
    riskHints,
  };
}
