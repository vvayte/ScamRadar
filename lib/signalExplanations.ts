/**
 * Returns a short explanation that matches the actual content of the signal.
 *
 * The previous implementation reused the same "weaponized scam playbook"
 * paragraph for every signal — including for benign / low-risk results, which
 * was contradictory and made the report look fake. Each rule below targets a
 * concrete pattern; the fallback is calibrated to the overall risk level so
 * a "no concrete evidence" signal on a Low result doesn't read as a scam
 * accusation.
 */

export type RiskBucket = "Low" | "Medium" | "High";

type Rule = {
  match: RegExp | ((reason: string) => boolean);
  explain: string;
};

const RULES: Rule[] = [
  {
    match: /off[- ]platform|outside (the )?platform|move (the )?(chat|conversation)|whatsapp|telegram|signal/i,
    explain:
      "Scammers push you off the marketplace because platform protections (refunds, dispute resolution, banned-user lists) do not apply once the chat moves elsewhere.",
  },
  {
    match: /urgen|hurry|right now|limited time|only today|act fast|expire/i,
    explain:
      "Time pressure is a classic manipulation tactic: it makes you skip verification steps. Legitimate sellers and platforms rarely require an instant decision.",
  },
  {
    match: /gift card|crypto|bitcoin|usdt|wire transfer|western union|moneygram|zelle|cash app/i,
    explain:
      "These payment methods are favored by scammers because they are irreversible and untraceable. A real seller is willing to use platform-protected payments.",
  },
  {
    match: /clone|look[- ]alike|typosquat|misspelled domain|suspicious url|fake site|phishing/i,
    explain:
      "The domain or URL does not match the legitimate brand it appears to imitate. Compare the host character-by-character; small swaps (e.g. 'rn' for 'm') are a known phishing pattern.",
  },
  {
    match: /(too good to be true|deeply discounted|far below market|massive discount|unrealistic price)/i,
    explain:
      "Prices well below market value are a common bait used to draw victims into off-platform deals or fake-listing scams. Real sellers price near comparable listings.",
  },
  {
    match: /verification (code|number)|otp|2fa|share (your )?code|send (the )?code/i,
    explain:
      "A verification code is for YOU only. Anyone asking you to read a code back to them is trying to take over an account or session — not verifying anything legitimate.",
  },
  {
    match: /personal (info|details)|ssn|social security|id (card|copy|photo)|passport|date of birth/i,
    explain:
      "Sellers and platforms rarely need this information up front. Sharing it enables identity theft or account takeover, even if no money changes hands.",
  },
  {
    match: /shipping (label|prepaid)|courier (link|invoice)|delivery (fee|charge)|customs fee/i,
    explain:
      "'Pay the shipping fee first' or 'click the courier link' is a long-running scam template that points to a phishing page styled like UPS/DHL/FedEx.",
  },
  {
    match: /(fake|phish|impersonat).*(support|admin|moderator|staff)/i,
    explain:
      "Real platform support never DMs first asking for credentials or payment. Treat anyone claiming to be staff in your inbox as suspicious until verified through the platform itself.",
  },
  {
    match: /no concrete evidence|no strong scam|no high[- ]confidence|no major scam|no hard scam|no high[- ]confidence scam|no (clear )?red flags/i,
    explain:
      "ScamRadar did not find strong evidence of a scam in this submission. Treat that as low confidence — not as proof of safety. Verify through official channels before sending money or personal data.",
  },
  {
    match: /already received|item delivered|paid after|received the (item|product)/i,
    explain:
      "You described a transaction that completed before payment, which generally lowers risk. Keep the receipt and any platform messages in case of a later dispute.",
  },
];

const FALLBACK: Record<RiskBucket, string> = {
  Low:
    "This signal contributed to a Low overall risk. ScamRadar surfaced it as something to be aware of, not as proof of fraud.",
  Medium:
    "This signal raised the risk level. Verify the counter-party through a second channel before continuing — domain, profile age, and payment method are the usual checkpoints.",
  High:
    "This signal matches a high-confidence scam pattern. Do not send money or personal data; capture screenshots and report through the platform.",
};

function normalizeRiskBucket(level: string): RiskBucket {
  const lower = String(level || "").toLowerCase();
  if (lower.includes("high")) return "High";
  if (lower.includes("medium")) return "Medium";
  return "Low";
}

export function explainSignal(reason: string, level: string): string {
  const bucket = normalizeRiskBucket(level);
  const trimmed = reason.trim();

  for (const rule of RULES) {
    if (typeof rule.match === "function") {
      if (rule.match(trimmed)) return rule.explain;
    } else if (rule.match.test(trimmed)) {
      return rule.explain;
    }
  }

  return FALLBACK[bucket];
}

export function explainSignals(reasons: string[], level: string): string[] {
  return reasons.map((reason) => explainSignal(reason, level));
}
