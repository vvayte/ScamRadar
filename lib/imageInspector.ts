import openai from "@/lib/openaiClient";

export type ImageInspectionResult = {
  extractedText: string;
  riskHints: string[];
  score: number;
  level: "Low" | "Medium" | "High";
  advice: string;
};

function normalizeLevel(level: unknown, fallbackScore: number): "Low" | "Medium" | "High" {
  if (typeof level === "string") {
    const normalized = level.toLowerCase();
    if (normalized.includes("high")) return "High";
    if (normalized.includes("medium")) return "Medium";
    if (normalized.includes("low")) return "Low";
  }

  if (fallbackScore >= 70) return "High";
  if (fallbackScore >= 40) return "Medium";
  return "Low";
}

function defaultAdvice(level: "Low" | "Medium" | "High"): string {
  if (level === "High") {
    return "Do not pay or share personal details until the listing is independently verified.";
  }
  if (level === "Medium") {
    return "Proceed cautiously and verify seller identity and payment path on-platform.";
  }
  return "No obvious scam signal found in the image, but continue with normal caution.";
}

function toDataUrl(fileType: string, bytes: Buffer): string {
  return `data:${fileType};base64,${bytes.toString("base64")}`;
}

function asTrimmedString(value: unknown, maxLen = 2200): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function asStringList(value: unknown, maxItems = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export async function inspectImageForScam(
  file: File,
  userContext: string
): Promise<ImageInspectionResult> {
  const fileBytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";
  const dataUrl = toDataUrl(mimeType, fileBytes);
  const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";

  const systemPrompt =
    'You analyze marketplace screenshots/photos for scam risk. Return ONLY JSON with keys: "score" (0-100), "level" (Low|Medium|High), "reasons" (array up to 3 short reasons), "advice" (one sentence), "extractedText" (important OCR text), "listingSignals" (array up to 4 short findings).';

  const contextHint = userContext
    ? `Additional user context:\n${userContext.slice(0, 1800)}`
    : "No additional user text context provided.";

  const userContent = [
    {
      type: "text",
      text: [
        "Analyze this uploaded listing image/screenshot for fraud signals.",
        "Focus on payment method, urgency pressure, off-platform contact requests, fake trust signals, and identity-data requests.",
        contextHint,
      ].join("\n\n"),
    },
    {
      type: "image_url",
      image_url: {
        url: dataUrl,
      },
    },
  ];

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent as any },
    ],
    temperature: 0.1,
    max_tokens: 400,
    response_format: { type: "json_object" },
  });

  let payload: any = {};
  try {
    payload = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch {
    payload = {};
  }

  const score = Math.min(100, Math.max(0, Number(payload.score) || 0));
  const level = normalizeLevel(payload.level, score);
  const extractedText = asTrimmedString(payload.extractedText, 2600);

  const reasons = asStringList(payload.reasons, 3);
  const listingSignals = asStringList(payload.listingSignals, 4);
  const riskHints = Array.from(new Set([...listingSignals, ...reasons])).slice(0, 4);

  const advice = asTrimmedString(payload.advice, 280) || defaultAdvice(level);

  return {
    extractedText,
    riskHints,
    score,
    level,
    advice,
  };
}
