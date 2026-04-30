export type RiskLevel = "Low" | "Medium" | "High";

export type RiskResultShape = {
  score: number;
  level: RiskLevel | string;
  reasons: string[];
  advice: string;
  skipAI?: boolean;
};

export type UrlSignalContext = {
  submittedText?: string;
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
const COMPLETED_TRANSACTION_ADVICE =
  "This sounds low risk: receiving the item before paying is generally safer. Keep receipts and payment records.";

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

const COMPLETED_TRANSACTION_PATTERNS = [
  /я\s+(?:уже\s+)?получил[аи]?\s+товар/i,
  /товар\s+(?:уже\s+)?(?:получен|пришел|приш[её]л|дош[её]л)/i,
  /вс[её]\s+прошло\s+(?:хорошо|прекрасно|нормально|отлично)/i,
  /товар\s+себя\s+оправдал/i,
  /(?:оплатил[аи]?|скинул[аи]?\s+деньги|заплатил[аи]?)\s+(?:уже\s+)?(?:после|потом)/i,
  /(?:после|потом)\s+(?:получения|того как получил[аи]?)\s+(?:товара\s+)?(?:оплатил[аи]?|заплатил[аи]?|скинул[аи]?\s+деньги)/i,
  /i\s+(?:already\s+)?received\s+(?:the\s+)?(?:item|product|goods)/i,
  /(?:item|product|goods)\s+(?:was\s+)?(?:delivered|received)/i,
  /everything\s+went\s+(?:well|great|fine)/i,
  /paid\s+after\s+(?:receiving|delivery)/i,
];

const UNRESOLVED_TRANSACTION_PROBLEM_PATTERNS = [
  /не\s+получил[аи]?\s+товар/i,
  /товар\s+не\s+(?:пришел|приш[её]л|дош[её]л|получен)/i,
  /деньги\s+скинул[аи]?.{0,80}(?:товар\s+не|не\s+получил)/i,
  /(?:обманули|кинули|пропал[аи]?|заблокировал[аи]?|возврат|спор)/i,
  /never\s+received\s+(?:the\s+)?(?:item|product|goods)/i,
  /(?:item|product|goods)\s+never\s+(?:arrived|came)/i,
  /paid.{0,80}(?:did not|didn't|never)\s+receive/i,
  /scammed|blocked|dispute|refund/i,
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

export function isCompletedLowRiskTransactionText(text: string): boolean {
  const normalized = text.toLowerCase().normalize("NFKC");
  if (!normalized.trim()) return false;
  if (UNRESOLVED_TRANSACTION_PROBLEM_PATTERNS.some((pattern) => pattern.test(normalized))) return false;

  const hasRussianCompletedSignals =
    (
      normalized.includes("\u043f\u043e\u043b\u0443\u0447\u0438\u043b \u0442\u043e\u0432\u0430\u0440") ||
      normalized.includes("\u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0430 \u0442\u043e\u0432\u0430\u0440") ||
      normalized.includes("\u0442\u043e\u0432\u0430\u0440 \u043f\u043e\u043b\u0443\u0447\u0435\u043d")
    ) &&
    (
      normalized.includes("\u0432\u0441\u0435 \u043f\u0440\u043e\u0448\u043b\u043e") ||
      normalized.includes("\u0432\u0441\u0451 \u043f\u0440\u043e\u0448\u043b\u043e") ||
      normalized.includes("\u0442\u043e\u0432\u0430\u0440 \u0441\u0435\u0431\u044f \u043e\u043f\u0440\u0430\u0432\u0434\u0430\u043b") ||
      normalized.includes("\u0442\u043e\u043b\u044c\u043a\u043e \u043f\u043e\u0442\u043e\u043c") ||
      normalized.includes("\u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u044f")
    );

  return hasRussianCompletedSignals || COMPLETED_TRANSACTION_PATTERNS.some((pattern) => pattern.test(normalized));
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
  const submittedText = String(context.submittedText || "");
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
    submittedText,
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

function completedTransactionReasons(): string[] {
  return [
    "Item was already received",
    "Payment happened after delivery",
    "No hard scam indicators found",
  ];
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
  const hasCompletedTransaction = isCompletedLowRiskTransactionText(signals.submittedText);

  let score = clampScore(result.score);
  let level = result.level as RiskLevel | string;
  let nextReasons = reasons;
  let advice = result.advice;
  let skipAI = result.skipAI;

  if (hasCompletedTransaction && supportedHardEvidence.length === 0) {
    score = Math.min(score, 25);
    level = "Low";
    nextReasons = completedTransactionReasons();
    advice = COMPLETED_TRANSACTION_ADVICE;
    skipAI = false;
  } else if (hasTrustedMarketplace && supportedHardEvidence.length === 0) {
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
