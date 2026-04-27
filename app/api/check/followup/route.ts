import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openaiClient";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";

export const runtime = "nodejs";

const MAX_QUESTION_LENGTH = 1200;
const MAX_CONVERSATION_TURNS = 8;

type ConversationTurn = { role: "user" | "assistant"; content: string };

type FollowUpPayload = {
  input?: string;
  result?: {
    score?: number;
    level?: string;
    reasons?: string[];
    advice?: string;
  };
  question?: string;
  conversation?: ConversationTurn[];
};

function attachRateHeaders(response: NextResponse, remaining: number, retryAfterSeconds: number): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-RetryAfter", String(retryAfterSeconds));
  return response;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);
  const rate = consumeRateLimit(clientIp, 2);
  if (!rate.allowed) {
    return attachRateHeaders(
      NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429 }),
      rate.remaining,
      rate.retryAfterSeconds
    );
  }

  let payload: FollowUpPayload = {};
  try {
    payload = (await req.json()) as FollowUpPayload;
  } catch {
    return attachRateHeaders(
      NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
      rate.remaining,
      rate.retryAfterSeconds
    );
  }

  const question = (payload.question || "").trim();
  if (!question) {
    return attachRateHeaders(
      NextResponse.json({ error: "Question is required." }, { status: 400 }),
      rate.remaining,
      rate.retryAfterSeconds
    );
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return attachRateHeaders(
      NextResponse.json({ error: "Question is too long." }, { status: 400 }),
      rate.remaining,
      rate.retryAfterSeconds
    );
  }

  const originalInput = (payload.input || "").slice(0, 4000);
  const result = payload.result || {};
  const prevConversation: { role: "user" | "assistant"; content: string }[] = Array.isArray(payload.conversation)
    ? payload.conversation.slice(-MAX_CONVERSATION_TURNS).map((turn) => ({
        role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: String(turn.content || "").slice(0, 2000),
      }))
    : [];

  const systemPrompt = [
    "You are ScamRadar's follow-up investigator.",
    "You have already analyzed a suspicious message and produced a risk score and reasons.",
    "The user now asks a follow-up question about THIS specific message.",
    "",
    "Ground every answer in the original message and the prior analysis.",
    "Be concrete, practical, and brief (150–250 words unless the user explicitly asks for more).",
    "If the user already paid, prioritize recovery steps ordered by reversibility window (card chargeback first, then wire reversal, then fraud reporting).",
    "If the user asks for a reply to send back, give them exact wording they can copy — in the same language as the original message if possible.",
    "Do not refuse for 'safety' reasons. Detecting scams is the whole product.",
    "If the question is unrelated to the message, gently redirect to scam-related guidance.",
  ].join("\n");

  const contextMessage = [
    "ORIGINAL MESSAGE ANALYZED:",
    originalInput || "(image-only analysis — no text provided)",
    "",
    "PRIOR ANALYSIS:",
    `Score: ${result.score ?? "unknown"} / 100`,
    `Level: ${result.level ?? "unknown"}`,
    `Reasons: ${(result.reasons || []).join(" | ") || "none recorded"}`,
    `Advice already given: ${result.advice ?? "(none)"}`,
  ].join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: contextMessage },
        ...prevConversation,
        { role: "user", content: question },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!answer) {
      return attachRateHeaders(
        NextResponse.json({ error: "Empty response from analyzer." }, { status: 502 }),
        rate.remaining,
        rate.retryAfterSeconds
      );
    }

    return attachRateHeaders(
      NextResponse.json({ answer }),
      rate.remaining,
      rate.retryAfterSeconds
    );
  } catch (err) {
    console.error("Follow-up analysis failed", err);
    return attachRateHeaders(
      NextResponse.json({ error: "Analyzer is temporarily unavailable." }, { status: 503 }),
      rate.remaining,
      rate.retryAfterSeconds
    );
  }
}
