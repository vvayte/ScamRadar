import { NextRequest, NextResponse } from "next/server";
import { applyRules, type RuleResult } from "@/lib/scamRules";
import openai from "@/lib/openaiClient";
import { inspectListingUrlsFromText, type UrlInspectionResult } from "@/lib/urlInspector";
import { inspectImageForScam, type ImageInspectionResult } from "@/lib/imageInspector";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";
import { getCommunityRiskHintsForUrls } from "@/lib/communityIntel";
import {
  applyUrlSignalsToResult,
  calibrateRiskResult,
  isCompletedLowRiskTransactionText,
  scoreToLevel,
} from "@/lib/riskCalibration";
import {
  applySuccessfulCheck,
  attachAnonymousCookie,
  canRunCheckStrict,
  resolveUsageSubject,
  usageSnapshot,
} from "@/lib/usage";
import { buildAnalysisArtifacts, type AnalysisArtifact } from "@/lib/analysisArtifacts";
import { explainSignals } from "@/lib/signalExplanations";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 12_000;

type ParsedRequestInput = {
  text: string;
  imageFile: File | null;
};

function withForensics(
  result: { score: number; level: string; reasons: string[]; advice: string; skipAI?: boolean },
  options: {
    urlInspection?: UrlInspectionResult | null;
    imageInspection?: ImageInspectionResult | null;
    communityHints?: string[];
    hasImage: boolean;
  }
): {
  score: number;
  level: string;
  reasons: string[];
  advice: string;
  skipAI?: boolean;
  artifacts: AnalysisArtifact[];
  signalExplanations: string[];
} {
  return {
    ...result,
    artifacts: buildAnalysisArtifacts(options),
    signalExplanations: explainSignals(result.reasons || [], result.level),
  };
}

function emptyUrlInspection(): UrlInspectionResult {
  return {
    submittedText: "",
    urls: [],
    extractedText: "",
    riskHints: [],
    fetchErrors: [],
    trustedMarketplaceHosts: [],
    hardRiskSignals: [],
    softRiskSignals: [],
    trustSignals: [],
  };
}

function attachRateHeaders(response: NextResponse, remaining: number, retryAfterSeconds: number): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-RetryAfter", String(retryAfterSeconds));
  return response;
}

function aiAnalyzerAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY) || process.env.NODE_ENV === "test";
}

function withDisplayableReasons(result: RuleResult): RuleResult {
  if (result.reasons.length > 0) return result;
  return {
    ...result,
    reasons: ["No high-confidence scam indicators matched offline rules."],
  };
}

function completedTransactionResult(): RuleResult {
  return {
    score: 10,
    level: "Low",
    reasons: [
      "Item was already received",
      "Payment happened after delivery",
      "No hard scam indicators found",
    ],
    advice:
      "This sounds low risk: receiving the item before paying is generally safer. Keep receipts and payment records.",
    skipAI: true,
  };
}

function isClearlyCompletedPurchaseWithoutComplaint(text: string): boolean {
  const normalized = text.toLowerCase().normalize("NFKC");
  if (!normalized.trim() || /https?:\/\//i.test(normalized)) return false;

  const complaintSignals = [
    "\u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0438\u043b",
    "\u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0430",
    "\u0442\u043e\u0432\u0430\u0440 \u043d\u0435",
    "\u043d\u0435 \u043f\u0440\u0438\u0448",
    "\u043d\u0435 \u0434\u043e\u0448",
    "\u043e\u0431\u043c\u0430\u043d",
    "\u043a\u0438\u043d\u0443\u043b",
    "\u043a\u0438\u043d\u0443\u043b\u0438",
    "\u043f\u0440\u043e\u043f\u0430\u043b",
    "\u0432\u043e\u0437\u0432\u0440\u0430\u0442",
    "\u0441\u043f\u043e\u0440",
    "\u0437\u0430\u0431\u043b\u043e\u043a",
    "never received",
    "did not receive",
    "didn't receive",
    "not delivered",
    "refund",
    "dispute",
    "scammed",
  ];
  if (complaintSignals.some((signal) => normalized.includes(signal))) return false;

  const receivedSignals = [
    "\u043f\u043e\u043b\u0443\u0447\u0438\u043b \u0442\u043e\u0432\u0430\u0440",
    "\u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0430 \u0442\u043e\u0432\u0430\u0440",
    "\u0442\u043e\u0432\u0430\u0440 \u043f\u043e\u043b\u0443\u0447\u0438\u043b",
    "\u0442\u043e\u0432\u0430\u0440 \u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0430",
    "\u0442\u043e\u0432\u0430\u0440 \u043f\u043e\u043b\u0443\u0447\u0435\u043d",
    "\u0442\u043e\u0432\u0430\u0440 \u043f\u0440\u0438\u0448",
    "\u0442\u043e\u0432\u0430\u0440 \u0434\u043e\u0448",
    "received the item",
    "received the product",
    "item was delivered",
    "product was delivered",
  ];

  const reassuringSignals = [
    "\u0432\u0441\u0435 \u043f\u0440\u043e\u0448\u043b\u043e",
    "\u0432\u0441\u0451 \u043f\u0440\u043e\u0448\u043b\u043e",
    "\u043f\u0440\u043e\u0448\u043b\u043e \u043f\u0440\u0435\u043a\u0440\u0430\u0441\u043d\u043e",
    "\u0442\u043e\u0432\u0430\u0440 \u0441\u0435\u0431\u044f \u043e\u043f\u0440\u0430\u0432\u0434\u0430\u043b",
    "\u0442\u043e\u043b\u044c\u043a\u043e \u043f\u043e\u0442\u043e\u043c",
    "\u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u044f",
    "\u043e\u043f\u043b\u0430\u0442\u0438\u043b \u043f\u043e\u0441\u043b\u0435",
    "\u0437\u0430\u043f\u043b\u0430\u0442\u0438\u043b \u043f\u043e\u0441\u043b\u0435",
    "\u0441\u043a\u0438\u043d\u0443\u043b \u0434\u0435\u043d\u044c\u0433\u0438",
    "everything went well",
    "everything went great",
    "paid after",
  ];

  return (
    receivedSignals.some((signal) => normalized.includes(signal)) &&
    reassuringSignals.some((signal) => normalized.includes(signal))
  );
}

function isCompletedPurchaseSafeText(text: string): boolean {
  return (
    isClearlyCompletedPurchaseWithoutComplaint(text) ||
    isCompletedLowRiskTransactionText(text)
  );
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

function withExtraUrlHints(
  inspection: UrlInspectionResult,
  extraHints: string[]
): UrlInspectionResult {
  return {
    ...inspection,
    riskHints: Array.from(new Set([...inspection.riskHints, ...extraHints])).slice(0, 6),
    hardRiskSignals: Array.from(new Set([...(inspection.hardRiskSignals || []), ...extraHints])).slice(0, 6),
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
    (urlInspection.trustSignals || []).length
      ? `[URL trust signals] ${(urlInspection.trustSignals || []).join("; ")}`
      : "",
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

    const usageSubject = await resolveUsageSubject(req);
    const { allowed: allowedToRun } = await canRunCheckStrict(usageSubject);
    if (!allowedToRun) {
      const response = NextResponse.json(
        {
          error: "Your free checks are used. Upgrade Shield or buy a one-off check to continue.",
          code: "PAYWALL_REQUIRED",
          usage: usageSnapshot(usageSubject),
        },
        { status: 402 }
      );
      attachAnonymousCookie(response, usageSubject);
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
      if (!aiAnalyzerAvailable()) {
        return attachRateHeaders(
          NextResponse.json(
            { error: "Image analysis is not configured yet. Try text or URL analysis instead." },
            { status: 503 }
          ),
          rateDecision.remaining,
          rateDecision.retryAfterSeconds
        );
      }
    }

    if (
      trimmedText &&
      !imageFile &&
      !/https?:\/\//i.test(trimmedText) &&
      isCompletedPurchaseSafeText(trimmedText)
    ) {
      const safeResult = completedTransactionResult();
      const usage = await applySuccessfulCheck({
        subject: usageSubject,
        input: trimmedText,
        result: safeResult,
        hasImage: false,
      });
      const response = NextResponse.json({
        ...withForensics(safeResult, { hasImage: false }),
        usage,
      });
      attachAnonymousCookie(response, usageSubject);
      return attachRateHeaders(response, rateDecision.remaining, rateDecision.retryAfterSeconds);
    }

    let urlInspection = trimmedText
      ? await inspectListingUrlsFromText(trimmedText)
      : emptyUrlInspection();
    urlInspection.submittedText = trimmedText;

    const communityHints = await getCommunityRiskHintsForUrls(urlInspection.urls);
    if (communityHints.length > 0) {
      urlInspection = withExtraUrlHints(urlInspection, communityHints);
    }

    let analysisInput = buildAnalysisInput(trimmedText, urlInspection);
    let heuristic = applyUrlSignalsToResult(applyRules(analysisInput), urlInspection);

    if (
      !imageFile &&
      isCompletedPurchaseSafeText(trimmedText) &&
      !(urlInspection.hardRiskSignals || []).length
    ) {
      const finalHeuristic = withDisplayableReasons(
        calibrateRiskResult(heuristic, urlInspection, { evidenceReasons: heuristic.reasons })
      );
      const usage = await applySuccessfulCheck({
        subject: usageSubject,
        input: trimmedText,
        result: finalHeuristic,
        hasImage: false,
      });
      const response = NextResponse.json({
        ...withForensics(finalHeuristic, {
          urlInspection,
          communityHints,
          hasImage: false,
        }),
        usage,
      });
      attachAnonymousCookie(response, usageSubject);
      return attachRateHeaders(response, rateDecision.remaining, rateDecision.retryAfterSeconds);
    }

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
        heuristic = applyUrlSignalsToResult(applyRules(analysisInput), urlInspection);
      }

      const mergedResult = calibrateRiskResult(
        mergeImageSignals(heuristic, imageInspection),
        urlInspection,
        { evidenceReasons: [...heuristic.reasons, ...imageInspection.riskHints] }
      );
      const usage = await applySuccessfulCheck({
        subject: usageSubject,
        input: analysisInput || trimmedText || "[image upload]",
        result: mergedResult,
        hasImage: true,
      });
      const response = NextResponse.json({
        ...withForensics(mergedResult, {
          urlInspection,
          imageInspection,
          communityHints,
          hasImage: true,
        }),
        usage,
      });
      attachAnonymousCookie(response, usageSubject);
      return attachRateHeaders(response, rateDecision.remaining, rateDecision.retryAfterSeconds);
    }

    if (heuristic.skipAI || !aiAnalyzerAvailable()) {
      const finalHeuristic = withDisplayableReasons(heuristic);
      const usage = await applySuccessfulCheck({
        subject: usageSubject,
        input: trimmedText,
        result: finalHeuristic,
        hasImage: false,
      });
      const response = NextResponse.json({
        ...withForensics(finalHeuristic, {
          urlInspection,
          communityHints,
          hasImage: false,
        }),
        usage,
      });
      attachAnonymousCookie(response, usageSubject);
      return attachRateHeaders(response, rateDecision.remaining, rateDecision.retryAfterSeconds);
    }

    const systemPrompt =
      'You are a security assistant specialising in fraud detection. A user has submitted text, URLs, or listing context for scam analysis. Respond ONLY in JSON with keys: "score" (0-100), "level" (Low, Medium, High), "reasons" (array of up to 3 short reasons), and "advice" (a concise sentence advising the user). Do not mark normal known marketplace or product URLs as High Risk unless the provided context contains concrete scam evidence such as a clone domain, off-platform payment/contact, high-risk payment method, sensitive-info request, or community reports. If the user says they already received the item and only paid after delivery, treat that as low risk unless there is separate evidence of fraud. Do not use vague unsupported reasons like unsolicited link, potential fake product, or lack of product detail.';
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
      const finalHeuristic = withDisplayableReasons(heuristic);
      const usage = await applySuccessfulCheck({
        subject: usageSubject,
        input: trimmedText,
        result: finalHeuristic,
        hasImage: false,
      });
      const response = NextResponse.json({
        ...withForensics(finalHeuristic, {
          urlInspection,
          communityHints,
          hasImage: false,
        }),
        usage,
      });
      attachAnonymousCookie(response, usageSubject);
      return attachRateHeaders(response, rateDecision.remaining, rateDecision.retryAfterSeconds);
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

    const supportedUrlHardSignals = urlInspection.hardRiskSignals || [];
    const evidenceAdjustedScore = supportedUrlHardSignals.length ? Math.max(score, heuristic.score) : score;
    const result = calibrateRiskResult(
      {
        score: evidenceAdjustedScore,
        level: supportedUrlHardSignals.length ? scoreToLevel(evidenceAdjustedScore) : level,
        reasons: Array.from(new Set([...supportedUrlHardSignals, ...reasons])).slice(0, 3),
        advice,
        skipAI: false,
      },
      urlInspection,
      { evidenceReasons: [...heuristic.reasons, ...supportedUrlHardSignals] }
    );
    const finalResult =
      !imageFile &&
      isCompletedPurchaseSafeText(trimmedText) &&
      supportedUrlHardSignals.length === 0
        ? completedTransactionResult()
        : result;
    const usage = await applySuccessfulCheck({
      subject: usageSubject,
      input: trimmedText,
      result: finalResult,
      hasImage: false,
    });
    const response = NextResponse.json({
      ...withForensics(finalResult, {
        urlInspection,
        communityHints,
        hasImage: false,
      }),
      usage,
    });
    attachAnonymousCookie(response, usageSubject);
    return attachRateHeaders(response, rateDecision.remaining, rateDecision.retryAfterSeconds);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
