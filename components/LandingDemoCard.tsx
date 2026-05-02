"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

/**
 * Animated demo card. Loops through five phases:
 *   1. typing      — message types in character-by-character
 *   2. scanning    — cyan beam sweeps over the message
 *   3. scoring     — risk % counts up 0 → 82 with a pulse
 *   4. signals     — three bullets reveal one-by-one
 *   5. next-step   — guidance slides up
 * After ~3s of "hold" the cycle restarts.
 */

type Phase = "typing" | "scan" | "score" | "signals" | "next";

const TARGET_RISK = 82;

export default function LandingDemoCard() {
  const { t, lang } = useT();
  const message = t("demo.message");

  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [revealedSignals, setRevealedSignals] = useState(0);
  const [cycle, setCycle] = useState(0); // bumped to restart loop / re-trigger keys

  const timersRef = useRef<number[]>([]);

  // Reset & restart whenever language changes (so the new translation types out fresh)
  useEffect(() => {
    setCycle((c) => c + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    // Clear any pending timers from previous cycle
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    setPhase("typing");
    setTyped("");
    setScore(0);
    setRevealedSignals(0);

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
    };

    // Phase 1: type message ~22ms per char
    const charDelay = 18;
    for (let i = 1; i <= message.length; i++) {
      schedule(() => setTyped(message.slice(0, i)), i * charDelay);
    }
    const afterType = message.length * charDelay;

    // Phase 2: scan
    schedule(() => setPhase("scan"), afterType + 100);

    // Phase 3: score counter
    const scoreStart = afterType + 850;
    schedule(() => setPhase("score"), scoreStart);
    const SCORE_DURATION = 900;
    const SCORE_STEPS = 30;
    for (let i = 1; i <= SCORE_STEPS; i++) {
      schedule(
        () => setScore(Math.round((TARGET_RISK * i) / SCORE_STEPS)),
        scoreStart + (SCORE_DURATION * i) / SCORE_STEPS
      );
    }

    // Phase 4: signals reveal
    const signalsStart = scoreStart + SCORE_DURATION + 150;
    schedule(() => setPhase("signals"), signalsStart);
    [1, 2, 3].forEach((n) => {
      schedule(() => setRevealedSignals(n), signalsStart + n * 320);
    });

    // Phase 5: next step
    const nextStart = signalsStart + 3 * 320 + 250;
    schedule(() => setPhase("next"), nextStart);

    // Restart loop after a hold
    const restartAt = nextStart + 3200;
    schedule(() => setCycle((c) => c + 1), restartAt);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [cycle, message]);

  const signals = [t("demo.signal.1"), t("demo.signal.2"), t("demo.signal.3")];
  const showScore = phase === "score" || phase === "signals" || phase === "next";
  const showNext = phase === "next";

  return (
    <div className="relative mx-auto mt-12 w-full max-w-2xl">
      {/* Outer glow that pulses with risk */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-[28px] blur-2xl transition-opacity duration-700"
        style={{
          opacity: showScore ? 0.55 : 0.15,
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(244,63,94,0.28), rgba(6,182,212,0.18) 55%, transparent 75%)",
        }}
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a121a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 mono-readout text-xs text-white/45">{t("demo.window")}</span>
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-cyan-200"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            live
          </span>
        </div>

        <div className="p-5 md:p-6">
          {/* Message box with scan beam */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/80">
            <div className="min-h-[4.5rem] md:min-h-[3.75rem]">
              {typed}
              {phase === "typing" ? (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-white/70 align-middle" />
              ) : null}
            </div>
            {/* Scan beam */}
            {phase === "scan" ? (
              <div
                key={`scan-${cycle}`}
                className="pointer-events-none absolute inset-x-0 top-0 h-[140%] sr-scan-beam"
              />
            ) : null}
          </div>

          {/* Risk + signals */}
          <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <div
                className={`mono-readout text-3xl font-black tabular-nums transition-all duration-500 ${
                  showScore ? "text-rose-300 drop-shadow-[0_0_18px_rgba(244,63,94,0.55)]" : "text-white/25"
                }`}
              >
                {showScore ? `${score}%` : "—"}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{t("demo.risk")}</div>
                <div
                  className={`text-base font-bold transition-colors duration-300 ${
                    score >= 70 ? "text-rose-200" : "text-white/40"
                  }`}
                >
                  {score >= 70 ? t("demo.high") : "—"}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-white/80">
              {signals.map((s, i) => {
                const visible = revealedSignals > i;
                return (
                  <div
                    key={`${cycle}-${i}`}
                    className="flex items-start gap-2 transition-all duration-500"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateX(0)" : "translateX(-8px)",
                    }}
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 ${
                        visible ? "shadow-[0_0_10px_rgba(244,63,94,0.8)]" : ""
                      }`}
                    />
                    <span>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next step — space is always reserved so the card height never jumps */}
          <div
            className="mt-5 rounded-xl border bg-black/30 px-4 py-3 text-sm leading-6 text-white/80 transition-all duration-500 min-h-[5.25rem]"
            style={{
              opacity: showNext ? 1 : 0,
              transform: showNext ? "translateY(0)" : "translateY(6px)",
              borderColor: showNext ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
            }}
          >
            <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">
              {t("demo.next")} ·{" "}
            </span>
            {t("demo.next.body")}
          </div>

          <div className="mt-4 text-[11px] text-white/40">{t("demo.disclaimer")}</div>
        </div>
      </div>

      <style jsx>{`
        .sr-scan-beam {
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(34, 211, 238, 0.0) 40%,
            rgba(34, 211, 238, 0.55) 50%,
            rgba(34, 211, 238, 0.0) 60%,
            transparent 100%
          );
          animation: sr-scan 750ms linear forwards;
        }
        @keyframes sr-scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(80%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
