import { NextRequest, NextResponse } from "next/server";
import { applyRules } from "@/lib/scamRules";
import { inspectListingUrlsFromText } from "@/lib/urlInspector";
import openai from "@/lib/openaiClient";

export const runtime = "nodejs";

function scoreToLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export async function POST(req: NextRequest) {
  try {
    const expectedToken = process.env.BOT_API_TOKEN || "";
    if (!expectedToken) {
      return NextResponse.json({ error: "Bot API is not configured." }, { status: 503 });
    }

    const providedToken = req.headers.get("x-bot-token") || "";
    if (!providedToken || providedToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized bot request." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const text = String(body?.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "Missing text." }, { status: 400 });
    }

    const urlInspection = await inspectListingUrlsFromText(text);
    const combined = [text, urlInspection.extractedText].filter(Boolean).join("\n").slice(0, 7000);
    const heuristic = applyRules(combined);

    if (heuristic.skipAI) {
      return NextResponse.json({
        ...heuristic,
        source: "heuristic",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content:
            'Return ONLY JSON with: "score" (0-100), "level" (Low|Medium|High), "reasons" (array up to 3), "advice" (short sentence).',
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

    return NextResponse.json({
      score,
      level,
      reasons,
      advice,
      source: "ai",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze bot input." }, { status: 500 });
  }
}
