export type RuleResult = {
  /** Scam probability score scaled 0–100 */
  score: number;
  /** Risk level derived from the score */
  level: 'Low' | 'Medium' | 'High';
  /** Short reasons explaining why the content might be a scam */
  reasons: string[];
  /** A short piece of advice corresponding to the risk */
  advice: string;
  /** When true, the heuristics are confident enough to skip the AI call */
  skipAI: boolean;
};

/**
 * A simple, rule‐based heuristic system that assigns weights to common scam indicators.
 * The weights and patterns are intentionally simple for MVP purposes and can be tuned later.
 */
const heuristics: { regex: RegExp; weight: number; reason: string }[] = [
  {
    regex: /\burgent|act now|immediately|asap|limited time\b/i,
    weight: 0.2,
    reason: 'Uses urgency or time pressure',
  },
  {
    regex:
      /\b(send money|transfer funds?|bank transfer|wire transfer|pay outside|outside the platform|paypal friends and family|zelle|cashapp|venmo)\b/i,
    weight: 0.25,
    reason: 'Pressure to pay or transfer funds',
  },
  {
    regex: /\bbitcoin|crypto|ethereum|usdt|cryptocurrency\b/i,
    weight: 0.2,
    reason: 'Mentions cryptocurrency as payment',
  },
  {
    regex: /\bwhatsapp|telegram|signal|discord|google hangouts\b/i,
    weight: 0.15,
    reason: 'Requests moving conversation off platform',
  },
  {
    regex:
      /\b(bit\.ly|tinyurl\.com|goo\.gl|t\.co|is\.gd|buff\.ly|cutt\.ly|rebrand\.ly|ow\.ly|shorturl\.at|tiny\.cc|rb\.gy|lnkd\.in|amzn\.to)\b/i,
    weight: 0.1,
    reason: 'Contains a shortened link',
  },
  {
    regex: /\bfree money|guaranteed|too good to be true|win big|prize\b/i,
    weight: 0.15,
    reason: 'Too good to be true promises',
  },
  {
    regex: /\bverify your account|account verification|update your account|confirm your details\b/i,
    weight: 0.15,
    reason: 'Requests sensitive account verification',
  },
  {
    regex:
      /\b(?:pay|send|buy|purchase)\b.{0,35}\bgift cards?\b|\bgift cards?\b.{0,35}\b(?:code|payment|pay|send)\b|itunes card|wire the money|western union\b/i,
    weight: 0.2,
    reason: 'Suggests paying via gift card or wire service',
  },
];

/**
 * Apply the simple rule set to a piece of text to estimate the scam likelihood.
 * @param input User‐submitted text
 */
export function applyRules(input: string): RuleResult {
  const text = input.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  for (const { regex, weight, reason } of heuristics) {
    if (regex.test(text)) {
      score += weight;
      reasons.push(reason);
    }
  }

  // Limit score to the range [0, 1]
  const normalized = Math.min(1, score);
  const percentage = Math.round(normalized * 100);

  let level: 'Low' | 'Medium' | 'High' = 'Low';
  if (percentage >= 70) {
    level = 'High';
  } else if (percentage >= 40) {
    level = 'Medium';
  }

  // Provide generic advice based on the risk level
  let advice: string;
  if (level === 'High') {
    advice = 'Do not proceed and report the scam immediately.';
  } else if (level === 'Medium') {
    advice = 'Proceed with extreme caution and verify independently.';
  } else {
    advice = 'Appears safe, but stay vigilant.';
  }

  // We skip the AI call if heuristics are confident (>=70%)
  const skipAI = normalized >= 0.7;

  return {
    score: percentage,
    level,
    reasons: reasons.slice(0, 3),
    advice,
    skipAI,
  };
}
