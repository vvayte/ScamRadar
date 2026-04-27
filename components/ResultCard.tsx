"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ScamResult {
  score: number;
  level: string;
  reasons: string[];
  advice: string;
}

interface ResultCardProps {
  result: ScamResult;
  partial?: boolean;
}

function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}

export default function ResultCard({ result, partial = false }: ResultCardProps) {
  const { score, level, reasons, advice } = result;
  const [copied, setCopied] = useState(false);
  const animatedScore = useCountUp(partial ? 0 : score);

  const normalizedLevel = String(level).toLowerCase();
  const riskLevel: "Low" | "Medium" | "High" = normalizedLevel.includes("low")
    ? "Low"
    : normalizedLevel.includes("medium")
      ? "Medium"
      : "High";

  const palette =
    riskLevel === "Low"
      ? {
          ring: "border-emerald-400/35",
          bg: "from-emerald-500/20 via-emerald-500/10 to-white/[0.02]",
          text: "text-emerald-300",
          badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/35",
          dot: "bg-emerald-400",
          progress: "bg-emerald-400",
        }
      : riskLevel === "Medium"
        ? {
            ring: "border-amber-400/35",
            bg: "from-amber-500/20 via-amber-500/10 to-white/[0.02]",
            text: "text-amber-300",
            badge: "bg-amber-500/20 text-amber-200 border-amber-500/35",
            dot: "bg-amber-400",
            progress: "bg-amber-400",
          }
        : {
            ring: "border-rose-400/40",
            bg: "from-rose-500/25 via-rose-500/10 to-white/[0.02]",
            text: "text-rose-300",
            badge: "bg-rose-500/20 text-rose-100 border-rose-500/40",
            dot: "bg-rose-400",
            progress: "bg-gradient-to-r from-rose-500 to-pink-500",
          };

  const copyAdvice = async () => {
    if (!advice || partial) return;
    try {
      await navigator.clipboard.writeText(advice);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const displayScore = Math.round(animatedScore);

  return (
    <div className={`fade-in-up mt-6 overflow-hidden rounded-3xl border ${palette.ring} bg-gradient-to-b ${palette.bg}`}>
      <div className="border-b border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">Scam analysis</div>
            <div className={`mono-readout mt-3 text-6xl font-black tracking-tight ${palette.text}`}>
              {partial ? riskLevel : `${displayScore}%`}
            </div>
            <div className="mt-2 text-2xl font-bold text-white">{riskLevel} Risk</div>
            {!partial ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                  <span>Risk confidence</span>
                  <span className="mono-readout">{displayScore}/100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${palette.progress} transition-[width] duration-500`}
                    style={{ width: `${Math.max(5, Math.min(100, displayScore))}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${palette.badge}`}>
            {partial ? "Partial result" : "Full result"}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/45">Why this is risky</div>

        <ul className="space-y-3">
          {reasons.slice(0, partial ? 1 : 3).map((reason, idx) => (
            <li
              key={idx}
              style={{ animationDelay: `${idx * 90}ms` }}
              className="fade-in-up flex items-start gap-3 rounded-2xl border border-white/12 bg-black/20 px-4 py-4 text-sm text-white/85"
            >
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${palette.dot}`} />
              <span>{reason}</span>
            </li>
          ))}

          {partial ? (
            <>
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/30 blur-[2px] select-none">
                Additional reason hidden for protected users
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/30 blur-[2px] select-none">
                Exact payment-risk explanation hidden
              </li>
            </>
          ) : null}
        </ul>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">What to do next</div>
            {!partial && advice ? (
              <button
                onClick={copyAdvice}
                className="rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/75 transition hover:bg-white/[0.12]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-base leading-7 text-white/85">
            {partial ? "Unlock the full analysis to see the exact score, full reasons, and what to do next." : advice}
          </p>
        </div>
      </div>
    </div>
  );
}
