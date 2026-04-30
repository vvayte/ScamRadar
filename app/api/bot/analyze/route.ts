import { NextRequest, NextResponse } from "next/server";
import { applyRules } from "@/lib/scamRules";
import { inspectListingUrlsFromText } from "@/lib/urlInspector";
import openai from "@/lib/openaiClient";
import {
  applyUrlSignalsToResult,
  calibrateRiskResult,
  isCompletedLowRiskTransactionText,
  scoreToLevel,
} from "@/lib/riskCalibration";

export const runtime = "nodejs";

function completedTransactionPayload() {
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

export async function POST(req: NextRequest) {
  try {
    const expectedToken = process.env.BOT_API_TOKEN || "";
    if (!expectedToken) {
      return NextResponse.json({ error: "Bot API is not configured." }, { status: 503 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice("bearer ".length).trim()
      : "";
    const providedToken = bearerToken || req.headers.get("x-bot-token") || "";
    if (!providedToken || providedToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized bot request." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const text = String(body?.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "Missing text." }, { status: 400 });
    }

    if (!/https?:\/\//i.test(text) && isCompletedPurchaseSafeText(text)) {
      return NextResponse.json({
        ...completedTransactionPayload(),
        source: "heuristic",
      });
    }

    const urlInspection = await inspectListingUrlsFromText(text);
    urlInspection.submittedText = text;
    const combined = [
      text,
      urlInspection.extractedText,
      urlInspection.trustSignals?.length
        ? `[URL trust signals] ${urlInspection.trustSignals.join("; ")}`
        : "",
      urlInspection.riskHints?.length
        ? `[URL risk hints] ${urlInspection.riskHints.join("; ")}`
        : "",
    ].filter(Boolean).join("\n").slice(0, 7000);
    const heuristic = applyUrlSignalsToResult(applyRules(combined), urlInspection);

    if (isCompletedPurchaseSafeText(text) && !(urlInspection.hardRiskSignals || []).length) {
      return NextResponse.json({
        ...calibrateRiskResult(heuristic, urlInspection, { evidenceReasons: heuristic.reasons }),
        source: "heuristic",
      });
    }

    if (heuristic.skipAI) {
      return NextResponse.json({
        ...heuristic,
        source: "heuristic",
      });
    }

    if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV !== "test") {
      return NextResponse.json({
        ...heuristic,
        reasons: heuristic.reasons.length
          ? heuristic.reasons
          : ["No high-confidence scam indicators matched offline rules."],
        source: "heuristic",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content:
            'Return ONLY JSON with: "score" (0-100), "level" (Low|Medium|High), "reasons" (array up to 3), "advice" (short sentence). Do not mark normal known marketplace or product URLs as High Risk unless there is concrete scam evidence such as a clone domain, off-platform payment/contact, high-risk payment method, sensitive-info request, or community reports. If the user says they already received the item and only paid after delivery, treat that as low risk unless there is separate evidence of fraud. Do not use vague unsupported reasons like unsolicited link, potential fake product, or lack of product detail.',
        },
        {
          role: "user",
          content: `Analyze this message for scam risk:\n${combined}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 160,
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(completion.choices[0].message.content || "{}");
    } catch {
      parsed = {};
    }

    const score = Math.min(100, Math.max(0, Number(parsed.score) || heuristic.score));
    const level = scoreToLevel(score);
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.slice(0, 3).map((value: any) => String(value))
      : heuristic.reasons;
    const advice = typeof parsed.advice === "string" ? parsed.advice : heuristic.advice;
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
      isCompletedPurchaseSafeText(text) && supportedUrlHardSignals.length === 0
        ? completedTransactionPayload()
        : result;

    return NextResponse.json({
      score: finalResult.score,
      level: finalResult.level,
      reasons: finalResult.reasons,
      advice: finalResult.advice,
      source: finalResult.skipAI ? "heuristic" : "ai",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze bot input." }, { status: 500 });
  }
}
