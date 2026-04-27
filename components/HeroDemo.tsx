"use client";

import { useEffect, useRef, useState } from "react";
import { AlertIcon, BoltIcon, ScanIcon, ShieldIcon } from "./Icons";

type Stage = "idle" | "scanning" | "result";

const SCRIPT = {
  message:
    "Hi! I'd love to buy your iPhone. I'm out of town so I'll send a courier tomorrow — please pay the $45 shipping via this link first: fb-marketp1ace-delivery.co/confirm",
  score: 94,
  level: "High risk",
  reasons: [
    "Lookalike domain (digit '1' replacing 'l' in 'marketplace')",
    "Buyer demands courier fee before any in-person meeting",
    "Off-platform payment link instead of platform escrow",
  ],
  advice: "Do not pay. Block the buyer and report the listing.",
};

function useCountUp(target: number, durationMs: number, run: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, run]);
  return v;
}

export default function HeroDemo() {
  const [stage, setStage] = useState<Stage>("idle");
  const [revealCount, setRevealCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const score = useCountUp(SCRIPT.score, 1400, stage === "result");

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          setStage("scanning");
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (stage !== "scanning") return;
    const t = setTimeout(() => setStage("result"), 2200);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "result") return;
    setRevealCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    SCRIPT.reasons.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealCount((c) => Math.max(c, i + 1)), 700 + i * 220));
    });
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  const replay = () => {
    setStage("scanning");
    setRevealCount(0);
  };

  const progressDeg = (score / 100) * 360;
  const ringColor =
    score >= 70 ? "#fb7185" : score >= 40 ? "#fbbf24" : "#34d399";

  return (
    <div ref={ref} className="hero-demo relative overflow-hidden rounded-[28px] border border-white/12 bg-[#06121b]/85 p-5 shadow-[0_30px_100px_-30px_rgba(34,211,238,0.35)] md:p-6">
      {/* Decorative radar sweep */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-500/30 via-cyan-500/0 to-transparent blur-2xl" aria-hidden />

      <div className="relative flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">
          <span className="blink h-1.5 w-1.5 rounded-full bg-cyan-300" />
          Live demo
        </div>
        <button
          onClick={replay}
          aria-label="Replay demo"
          className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white"
        >
          Replay ↻
        </button>
      </div>

      {/* Message bubble */}
      <div className="relative mt-4 rounded-2xl border border-white/10 bg-black/45 p-4 text-sm text-white/85">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          <span>Marketplace DM · 14:32</span>
        </div>
        <div className="leading-6">
          {SCRIPT.message.split(/(fb-marketp1ace-delivery\.co\/confirm|\$45)/).map((part, i) => {
            if (part === "fb-marketp1ace-delivery.co/confirm") {
              return (
                <span key={i} className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-200 underline decoration-rose-300/60 underline-offset-2">
                  {part}
                </span>
              );
            }
            if (part === "$45") {
              return (
                <span key={i} className="rounded bg-amber-400/20 px-1.5 py-0.5 font-semibold text-amber-200">
                  {part}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
        {stage === "scanning" && <div className="hero-scan-line pointer-events-none absolute inset-x-0" aria-hidden />}
      </div>

      {/* Verdict */}
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-4">
        {/* Ring */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${ringColor} ${progressDeg}deg, rgba(255,255,255,0.08) ${progressDeg}deg)`,
              transition: "background 0.2s linear",
            }}
            aria-hidden
          />
          <div className="absolute inset-[6px] rounded-full bg-[#06121b]" aria-hidden />
          <div className="relative text-center">
            <div className="mono-readout text-3xl font-black leading-none" style={{ color: stage === "result" ? ringColor : "rgba(255,255,255,0.55)" }}>
              {stage === "idle" ? "—" : score}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
              {stage === "idle" ? "Idle" : stage === "scanning" ? "Scanning" : "Risk"}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex items-center gap-2">
            {stage === "scanning" ? (
              <>
                <ScanIcon size={16} className="text-cyan-300" />
                <span className="text-sm font-bold text-cyan-100">Inspecting domain, payment terms, urgency cues…</span>
              </>
            ) : stage === "result" ? (
              <>
                <AlertIcon size={16} className="text-rose-300" />
                <span className="text-base font-black text-rose-200">{SCRIPT.level} · courier-fee scam</span>
              </>
            ) : (
              <>
                <ShieldIcon size={16} className="text-cyan-200" />
                <span className="text-sm text-white/65">Awaiting check…</span>
              </>
            )}
          </div>
          <div className="mt-1 text-xs text-white/55">
            {stage === "result" ? "Pattern matched in 1.8s · 11 community reports" : "Detection engine ready"}
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="mt-5 space-y-2">
        {SCRIPT.reasons.map((reason, i) => {
          const visible = stage === "result" && revealCount > i;
          return (
            <div
              key={reason}
              className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-xs transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
            >
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-black text-rose-200">
                {i + 1}
              </span>
              <span className="text-white/80">{reason}</span>
            </div>
          );
        })}
      </div>

      {/* Advice */}
      <div
        className={`mt-4 flex items-start gap-3 rounded-xl border border-cyan-300/25 bg-cyan-500/10 px-3 py-3 text-xs transition-all duration-500 ${stage === "result" && revealCount >= SCRIPT.reasons.length ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
      >
        <BoltIcon size={16} className="mt-0.5 flex-shrink-0 text-cyan-200" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Recommended action</div>
          <div className="mt-0.5 text-white/85">{SCRIPT.advice}</div>
        </div>
      </div>
    </div>
  );
}
