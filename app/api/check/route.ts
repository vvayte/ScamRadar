import { NextRequest, NextResponse } from "next/server";
import { applyRules, type RuleResult } from "@/lib/scamRules";
import openai from "@/lib/openaiClient";
import { inspectListingUrlsFromText, type UrlInspectionResult } from "@/lib/urlInspector";
import { inspectImageForScam, type ImageInspectionResult } from "@/lib/imageInspector";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";
import { getCommunityRiskHintsForUrls } from "@/lib/platformDataStore";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 12_000;

type ParsedRequestInput = {
  text: string;
  imageFile: File | null;
};

function emptyUrlInspection(): UrlInspectionResult {
  return {
    urls: [],
    extractedText: "",
    riskHints: [],
    fetchErrors: [],
  };
}

function scoreToLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function attachRateHeaders(response: NextResponse, remaining: number, retryAfterSeconds: number): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-RetryAfter", String(retryAfterSeconds));
  return response;
}

async function parseRequestInput(req: NextRequest): Promise<ParsedRequestInput> {
  const contentType = (req.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const textValue = formData.get("text");
    const imageValue = formData.get("image");

    return {
      text: typeof textValue === "string" ? textValue : "",
      imageFile: imageValue instanceof File ? imageValue : null,
    };
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  return {
    text: typeof body?.text === "string" ? body.text : "",
    imageFile: null,
  };
}

function validateImageFile(file: File): string | null {
  if (!file.type || !file.type.startsWith("image/")) {
    return "Only image files are supported.";
  }

  if (file.size <= 0) {
    return "Uploaded image is empty.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image is too large. Maximum supported size is 8MB.";
  }

  return null;
}

function applyUrlSignals(base: RuleResult, urlInspection: UrlInspectionResult): RuleResult {
  const uniqueHints = Array.from(new Set(urlInspection.riskHints));
  const bonus = Math.min(36, uniqueHints.length * 14 + (urlInspection.fetchErrors.length ? 6 : 0));
  const score = Math.min(100, base.score + bonus);
  const level = scoreToLevel(score);

  const reasons = Array.from(new Set([...uniqueHints, ...base.reasons])).slice(0, 3);

  let advice = base.advice;
  if (uniqueHints.length > 0 && score >= 70) {
    advice =
      "Do not proceed until you verify the seller independently on the original marketplace platform.";
  }

  return {
    ...base,
    score,
    level,
    reasons: reasons.length ? reasons : base.reasons,
    advice,
    skipAI: score >= 70 || base.skipAI,
  };
}

function withExtraUrlHints(
  inspection: UrlInspectionResult,
  extraHints: string[]
): UrlInspectionResult {
  return {
    ...inspection,
    riskHints: Array.from(new Set([...inspection.riskHints, ...extraHints])).slice(0, 6),
  };
}

function mergeImageSignals(base: RuleResult, imageInspection: ImageInspectionResult): RuleResult {
  const score = Math.min(100, Math.max(base.score, imageInspection.score));
  const level = scoreToLevel(score);
  const reasons = Array.from(new Set([...imageInspection.riskHints, ...base.reasons])).slice(0, 3);
  const advice = imageInspection.advice || base.advice;

  return {
    ...base,
    score,
    level,
    reasons: reasons.length ? reasons : base.reasons,
    advice,
    // We already used AI in image inspection, so this response is not a "skip AI" path.
    skipAI: false,
  };
}

function buildAnalysisInput(originalText: string, urlInspection: UrlInspectionResult): string {
  if (!urlInspection.extractedText) return originalText;

  return [
    originalText,
    "",
    "[Extracted listing context from URLs]",
    urlInspection.extractedText,
    urlInspection.riskHints.length
      ? `[URL risk hints] ${urlInspection.riskHints.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 7000);
}

/**
 * API endpoint that accepts suspicious text and optionally an image and returns
 * a structured scam evaluation. It runs heuristics first, enriches with URL inspection,
 * then calls the language model only when needed.
 */
export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") || "0");
    if (contentLength && contentLength > MAX_REQUEST_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Request is too large. Maximum payload size is 10MB." },
        { status: 413 }
      );
    }

    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    const requestCost = contentType.includes("multipart/form-data") ? 4 : 1;
    const rateDecision = consumeRateLimit(getClientIp(req.headers), requestCost);
    if (!rateDecision.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(rateDecision.retryAfterSeconds));
      return attachRateHeaders(response, rateDecision.remaining, rateDecision.retryAfterSeconds);
    }

    const { text, imageFile } = await parseRequestInput(req);
    const trimmedText = text.replace(/\u0000/g, "").trim();

    if (!trimmedText && !imageFile) {
      return attachRateHeaders(
        NextResponse.json({ error: "No text provided" }, { status: 400 }),
        rateDecision.remaining,
        rateDecision.retryAfterSeconds
      );
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return attachRateHeaders(
        NextResponse.json(
          { error: "Text is too long. Maximum supported length is 12,000 characters." },
          { status: 413 }
        ),
        rateDecision.remaining,
        rateDecision.retryAfterSeconds
      );
    }

    if (imageFile) {
      const imageValidationError = validateImageFile(imageFile);
      if (imageValidationError) {
        return attachRateHeaders(
          NextResponse.json({ error: imageValidationError }, { status: 400 }),
          rateDecision.remaining,
          rateDecision.retryAfterSeconds
        );
      }
    }

    let urlInspection = trimmedText
      ? await inspectListingUrlsFromText(trimmedText)
      : emptyUrlInspection();

    const communityHints = getCommunityRiskHintsForUrls(urlInspection.urls);
    if (communityHints.length > 0) {
      urlInspection = withExtraUrlHints(urlInspection, communityHints);
    }

    let analysisInput = buildAnalysisInput(trimmedText, urlInspection);
    let heuristic = applyUrlSignals(applyRules(analysisInput), urlInspection);

    if (imageFile) {
      let imageInspection: ImageInspectionResult;
      try {
        imageInspection = await inspectImageForScam(imageFile, analysisInput);
      } catch (error) {
        console.error("Image analysis failed", error);
        return attachRateHeaders(
          NextResponse.json(
            { error: "Image analysis failed. Please try another image." },
            { status: 502 }
          ),
          rateDecision.remaining,
          rateDecision.retryAfterSeconds
        );
      }

      if (imageInspection.extractedText) {
        analysisInput = [analysisInput, "[Extracted image text]", imageInspection.extractedText]
          .filter(Boolean)
          .join("\n")
          .slice(0, 7000);
        heuristic = applyUrlSignals(applyRules(analysisInput), urlInspection);
      }

      const mergedResult = mergeImageSignals(heuristic, imageInspection);
      return attachRateHeaders(
        NextResponse.json(mergedResult),
        rateDecision.remaining,
        rateDecision.retryAfterSeconds
      );
    }

    if (heuristic.skipAI) {
      return attachRateHeaders(
        NextResponse.json(heuristic),
        rateDecision.remaining,
        rateDecision.retryAfterSeconds
      );
    }

    const systemPrompt =
      'You are a security assistant specialising in fraud detection. A user has submitted text they suspect might be a scam. Respond ONLY in JSON with keys: "score" (0-100), "level" (Low, Medium, High), "reasons" (array of up to 3 short reasons), and "advice" (a concise sentence advising the user). Do not include any additional text.';
    const userPrompt = `Text to evaluate:\n${analysisInput}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 120,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    let payload: any;
    try {
      payload = JSON.parse(completion.choices[0].message.content);
    } catch {
      return attachRateHeaders(
        NextResponse.json(heuristic),
        rateDecision.remaining,
        rateDecision.retryAfterSeconds
      );
    }

    const score = Math.min(100, Math.max(0, Number(payload.score) || 0));
    let level: "Low" | "Medium" | "High" = "Low";
    if (typeof payload.level === "string") {
      const normalized = payload.level.toLowerCase();
      if (normalized.includes("high")) level = "High";
      else if (normalized.includes("medium")) level = "Medium";
    }

    const reasons = Array.isArray(payload.reasons)
      ? payload.reasons.slice(0, 3).map((reason: any) => String(reason))
      : heuristic.reasons;
    const advice = typeof payload.advice === "string" ? payload.advice : heuristic.advice;

    return attachRateHeaders(
      NextResponse.json({
        score,
        level,
        reasons,
        advice,
        skipAI: false,
      }),
      rateDecision.remaining,
      rateDecision.retryAfterSeconds
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
