import { NextRequest, NextResponse } from "next/server";
import { applyRules } from "@/lib/scamRules";
import { inspectListingUrlsFromText } from "@/lib/urlInspector";
import openai from "@/lib/openaiClient";
import {
  applyUrlSignalsToResult,
  calibrateRiskResult,
  scoreToLevel,
} from "@/lib/riskCalibration";

export const runtime = "nodejs";

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

    const urlInspection = await inspectListingUrlsFromText(text);
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
            'Return ONLY JSON with: "score" (0-100), "level" (Low|Medium|High), "reasons" (array up to 3), "advice" (short sentence). Do not mark normal known marketplace or product URLs as High Risk unless there is concrete scam evidence such as a clone domain, off-platform payment/contact, high-risk payment method, sensitive-info request, or community reports. Do not use vague unsupported reasons like unsolicited link, potential fake product, or lack of product detail.',
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

    return NextResponse.json({
      score: result.score,
      level: result.level,
      reasons: result.reasons,
      advice: result.advice,
      source: "ai",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze bot input." }, { status: 500 });
  }
}
