export type RiskLevel = "Low" | "Medium" | "High";

export type RiskResultShape = {
  score: number;
  level: RiskLevel | string;
  reasons: string[];
  advice: string;
  skipAI?: boolean;
};

export type UrlSignalContext = {
  urls?: string[];
  riskHints?: string[];
  fetchErrors?: string[];
  trustedMarketplaceHosts?: string[];
  hardRiskSignals?: string[];
  softRiskSignals?: string[];
  trustSignals?: string[];
};

type CalibrationOptions = {
  evidenceReasons?: string[];
};

const TRUSTED_MARKETPLACE_LOW_ADVICE =
  "This looks like a normal marketplace link. Use the official checkout and verify seller details before paying.";
const TRUSTED_MARKETPLACE_MEDIUM_ADVICE =
  "Use the official marketplace checkout and avoid off-platform payment or contact requests.";

const HARD_EVIDENCE_PATTERNS = [
  /clone domain/i,
  /lookalike/i,
  /punycode/i,
  /redirects? to a different domain/i,
  /community reports?/i,
  /off-platform|outside the platform|bypass platform/i,
  /\b(?:whatsapp|telegram|signal|discord)\b/i,
  /wire transfer|bank transfer|western union/i,
  /high-risk payment methods/i,
  /gift card(?: code| payment| as payment)?/i,
  /crypto|bitcoin|ethereum|usdt/i,
  /paypal friends and family/i,
  /weak buyer protection/i,
  /prepayment|deposit|reservation fee|booking fee/i,
  /sensitive personal|send id|passport|confirm details|verify account/i,
  /extra payment fees|courier fee|insurance release fee/i,
];

const SOFT_EVIDENCE_PATTERNS = [
  /urgency|urgent|limited time|only today|final notice/i,
  /could not inspect|could not fully inspect|fetch|unsupported content-type/i,
  /limited extractable|incomplete listing|limited listing/i,
  /shortened link|shortener/i,
];

const UNSUPPORTED_MARKETPLACE_REASON_PATTERNS = [
  /unsolicited link/i,
  /potential fake product/i,
  /\bfake product\b/i,
  /lack of detailed/i,
  /lack of detail/i,
  /not enough detail/i,
  /limited product information/i,
  /suspicious links?/i,
  /shortened or suspicious links?/i,
  /unknown seller/i,
  /generic product/i,
];

function asStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => String(value || "").trim()).filter(Boolean);
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function clampScore(value: unknown): number {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

export function scoreToLevel(score: number): RiskLevel {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function isHardEvidence(reason: string): boolean {
  return HARD_EVIDENCE_PATTERNS.some((pattern) => pattern.test(reason));
}

function isSoftEvidence(reason: string): boolean {
  return SOFT_EVIDENCE_PATTERNS.some((pattern) => pattern.test(reason));
}

function isUnsupportedMarketplaceReason(reason: string): boolean {
  return UNSUPPORTED_MARKETPLACE_REASON_PATTERNS.some((pattern) => pattern.test(reason));
}

function signalWeight(signal: string): number {
  if (/clone domain|lookalike|punycode|community reports?/i.test(signal)) return 72;
  if (/redirects? to a different domain/i.test(signal)) return 55;
  if (/wire transfer|bank transfer|western union|high-risk payment methods|gift card|crypto|bitcoin|usdt|paypal friends/i.test(signal)) {
    return 30;
  }
  if (/off-platform|outside the platform|bypass platform|whatsapp|telegram|signal|discord/i.test(signal)) {
    return 26;
  }
  if (/sensitive personal|send id|passport|confirm details|verify account/i.test(signal)) return 28;
  return 22;
}

function extractContextSignals(context: UrlSignalContext) {
  const urls = asStringArray(context.urls);
  const riskHints = asStringArray(context.riskHints);
  const fetchErrors = asStringArray(context.fetchErrors);
  const trustedMarketplaceHosts = asStringArray(context.trustedMarketplaceHosts);
  const trustSignals = asStringArray(context.trustSignals);

  const explicitHard = asStringArray(context.hardRiskSignals);
  const inferredHard = explicitHard.length ? [] : riskHints.filter(isHardEvidence);
  const hardRiskSignals = dedupe([...explicitHard, ...inferredHard]);

  const explicitSoft = asStringArray(context.softRiskSignals);
  const inferredSoft = explicitSoft.length ? [] : riskHints.filter(isSoftEvidence);
  const fetchSoftSignals = fetchErrors.length ? ["URL could not be fully inspected"] : [];
  const softRiskSignals = dedupe([...explicitSoft, ...inferredSoft, ...fetchSoftSignals]);

  return {
    urls,
    riskHints,
    fetchErrors,
    trustedMarketplaceHosts,
    trustSignals,
    hardRiskSignals,
    softRiskSignals,
  };
}

function trustedMarketplaceReasons(signals: ReturnType<typeof extractContextSignals>, level: RiskLevel): string[] {
  const trustReason =
    signals.trustSignals[0] ||
    (signals.trustedMarketplaceHosts[0]
      ? `Known marketplace domain: ${signals.trustedMarketplaceHosts[0]}`
      : "Known marketplace link inspected");

  const reasons = [trustReason];
  if (level === "Medium" && signals.softRiskSignals.length) {
    reasons.push(signals.softRiskSignals[0]);
  }
  reasons.push("No hard scam indicators found");
  return dedupe(reasons).slice(0, 3);
}

function filterUnsupportedReasons(reasons: string[], hasHardEvidence: boolean): string[] {
  if (hasHardEvidence) return reasons;
  return reasons.filter((reason) => !isUnsupportedMarketplaceReason(reason));
}

export function applyUrlSignalsToResult<T extends RiskResultShape>(
  base: T,
  context: UrlSignalContext
): T {
  const signals = extractContextSignals(context);
  const hardBonus = Math.min(
    85,
    signals.hardRiskSignals.reduce((total, signal) => total + signalWeight(signal), 0)
  );
  const softBonus = Math.min(14, signals.softRiskSignals.length * 6);
  const score = clampScore(base.score + hardBonus + softBonus);
  const reasons = dedupe([
    ...signals.hardRiskSignals,
    ...signals.softRiskSignals,
    ...asStringArray(base.reasons),
  ]).slice(0, 3);

  const advice =
    signals.hardRiskSignals.length && score >= 70
      ? "Do not proceed until you verify the seller independently on the original marketplace platform."
      : base.advice;

  return calibrateRiskResult(
    {
      ...base,
      score,
      level: scoreToLevel(score),
      reasons: reasons.length ? reasons : base.reasons,
      advice,
      skipAI: score >= 70 && (signals.hardRiskSignals.length > 0 || Boolean(base.skipAI)),
    },
    context,
    { evidenceReasons: [...signals.hardRiskSignals, ...signals.softRiskSignals, ...asStringArray(base.reasons)] }
  );
}

export function calibrateRiskResult<T extends RiskResultShape>(
  result: T,
  context: UrlSignalContext = {},
  options: CalibrationOptions = {}
): T {
  const signals = extractContextSignals(context);
  const reasons = asStringArray(result.reasons);
  const evidenceReasons = asStringArray(options.evidenceReasons);
  const supportedHardEvidence = dedupe([
    ...signals.hardRiskSignals,
    ...evidenceReasons.filter(isHardEvidence),
  ]);

  const hasUrls = signals.urls.length > 0;
  const hasTrustedMarketplace =
    signals.trustedMarketplaceHosts.length > 0 || signals.trustSignals.some((signal) => /marketplace/i.test(signal));
  const hasSoftEvidence = signals.softRiskSignals.length > 0 || signals.fetchErrors.length > 0;

  let score = clampScore(result.score);
  let level = result.level as RiskLevel | string;
  let nextReasons = reasons;
  let advice = result.advice;
  let skipAI = result.skipAI;

  if (hasTrustedMarketplace && supportedHardEvidence.length === 0) {
    const maxScore = hasSoftEvidence ? 55 : 30;
    score = Math.min(score, maxScore);
    const calibratedLevel = scoreToLevel(score);
    level = calibratedLevel;
    nextReasons = trustedMarketplaceReasons(signals, calibratedLevel);
    advice = calibratedLevel === "Medium" ? TRUSTED_MARKETPLACE_MEDIUM_ADVICE : TRUSTED_MARKETPLACE_LOW_ADVICE;
    skipAI = false;
  } else if (hasUrls && supportedHardEvidence.length === 0 && score >= 70) {
    score = 55;
    level = "Medium";
    nextReasons = filterUnsupportedReasons(nextReasons, false);
    if (!nextReasons.length) {
      nextReasons = hasSoftEvidence ? signals.softRiskSignals.slice(0, 3) : ["No hard scam indicators found"];
    }
    skipAI = false;
  } else {
    nextReasons = filterUnsupportedReasons(nextReasons, supportedHardEvidence.length > 0);
  }

  return {
    ...result,
    score,
    level,
    reasons: nextReasons.slice(0, 3),
    advice,
    skipAI,
  };
}
