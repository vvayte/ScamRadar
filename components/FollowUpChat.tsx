"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ScamResult } from "./ResultCard";

type Turn = { role: "user" | "assistant"; content: string };

type Props = {
  input: string;
  result: ScamResult;
  locked: boolean;
};

const SUGGESTIONS = [
  "Why is this riskier than a normal buyer message?",
  "What exactly should I say back, word-for-word?",
  "If I already paid, what do I do right now?",
  "How can I verify the seller is real before committing?",
];

export default function FollowUpChat({ input, result, locked }: Props) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const ask = async (q: string) => {
    if (!q.trim() || loading || locked) return;
    setError("");
    const userTurn: Turn = { role: "user", content: q };
    const history = [...turns, userTurn];
    setTurns(history);
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch("/api/check/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          result,
          question: q,
          conversation: turns,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Follow-up failed. Please try again.");
        setTurns(turns);
        return;
      }
      setTurns([...history, { role: "assistant", content: String(data?.answer || "") }]);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 50);
    } catch {
      setError("Network error. Please try again.");
      setTurns(turns);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in-up mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-500/15 text-lg">💬</div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/50">Follow-up investigation</div>
              <div className="text-lg font-bold">Ask anything about this case</div>
            </div>
          </div>
          {locked ? (
            <Link href="/pricing" className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black text-white transition hover:bg-cyan-400 glow-red">
              Unlock chat
            </Link>
          ) : (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
              ✓ Unlimited
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {turns.length === 0 ? (
          <div className="text-sm text-white/60">
            Ask a follow-up about this message — ScamRadar will answer in the context of the analysis above,
            not a generic reply. Try one of these starters:
          </div>
        ) : null}

        <div ref={scrollRef} className="mt-3 max-h-80 space-y-3 overflow-auto">
          {turns.map((turn, i) => (
            <div
              key={i}
              className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                turn.role === "user"
                  ? "border-white/10 bg-white/[0.04] text-white/85"
                  : "border-cyan-300/25 bg-cyan-500/10 text-white/90"
              }`}
            >
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/45">
                {turn.role === "user" ? "You" : "ScamRadar"}
              </div>
              <div className="whitespace-pre-wrap">{turn.content}</div>
            </div>
          ))}
        </div>

        {turns.length === 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                disabled={locked}
                onClick={() => ask(s)}
                className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm text-cyan-100">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask(question)}
            disabled={locked || loading}
            placeholder={locked ? "Upgrade Shield to ask follow-ups" : "Type your question…"}
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-300/35 disabled:opacity-60"
          />
          <button
            onClick={() => ask(question)}
            disabled={locked || loading || !question.trim()}
            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "..." : "Ask"}
          </button>
        </div>

        {locked ? (
          <div className="mt-3 rounded-2xl border border-cyan-300/25 bg-cyan-500/10 p-4 text-sm text-white/80">
            <div className="font-bold text-white">Follow-ups are a Shield feature.</div>
            <div className="mt-1 text-white/70">
              One-shot scores are useful; case-aware investigation is where real decisions happen. Unlock
              unlimited follow-ups, forensic artifacts, and PDF evidence pack.
            </div>
            <Link
              href="/pricing"
              className="mt-3 inline-flex rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-400"
            >
              Upgrade for $5/mo
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
