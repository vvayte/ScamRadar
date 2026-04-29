"use client";

import Link from "next/link";
import { useState } from "react";
import { BoltIcon, CheckIcon, ShieldIcon, StarIcon } from "@/components/Icons";

type PlanId = "single" | "monthly" | "yearly";

export default function PricingPage() {
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const handleClick = async (id: PlanId) => {
    setPending(id);
    setError("");
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: id }),
      });
      const data = await res.json();
      if (data?.url) { window.location.href = data.url; return; }
      setError(data?.error || "Unable to initialize checkout. Please try again.");
    } catch {
      setError("Unable to initialize checkout. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="site-shell min-h-screen text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-16">

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100">
              Protection pricing
            </div>
            <h1 className="mt-4 font-serif-display text-4xl font-black leading-tight md:text-6xl">
              Pick your <span className="gradient-text">shield</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 soft-muted">
              3-day free trial on any subscription. Cancel anytime — no charge if you cancel before the trial ends.
            </p>
          </div>
          <Link href="/" className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]">
            ← Back to checker
          </Link>
        </div>

        {/* Yearly savings banner */}
        <div className="mt-10 flex items-center gap-4 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent px-5 py-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-200">
            <BoltIcon size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-amber-200">Limited-time offer — save 50% with yearly billing</div>
            <div className="mt-0.5 text-xs text-amber-100/70">Yearly plan is just $0.08/day — less than a gum stick. Unlimited scans, forever.</div>
          </div>
          <button
            onClick={() => handleClick("yearly")}
            disabled={pending !== null}
            className="ml-auto flex-shrink-0 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-amber-900 transition hover:bg-amber-300 disabled:opacity-60"
          >
            Claim 50% off →
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-300/35 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {/* Plans grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Single Check */}
          <div className="fade-in-up glass-panel relative overflow-hidden rounded-[32px] border border-white/10 p-6 md:p-8"
            style={{ animationDelay: "0ms" }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Quick pass</div>
            <h2 className="mt-4 text-2xl font-black">Single Check</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="mono-readout text-5xl font-black tracking-tight text-white">$0.99</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">One urgent answer when you need it now.</p>

            <div className="mt-6 space-y-2.5">
              {["1 full scam check", "Exact score + full reasons", "Action advice included"].map((p) => (
                <div key={p} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/80">
                  <CheckIcon size={14} className="flex-shrink-0 text-cyan-300" />
                  {p}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleClick("single")}
              disabled={pending !== null}
              className="press mt-8 w-full rounded-2xl bg-white/10 border border-white/15 px-5 py-4 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              {pending === "single" ? "Redirecting..." : "Unlock 1 Check"}
            </button>
          </div>

          {/* Monthly — recommended */}
          <div className="fade-in-up relative overflow-hidden rounded-[32px] border border-cyan-300/40 bg-gradient-to-b from-cyan-500/20 to-[#04141d] p-6 md:p-8"
            style={{ animationDelay: "90ms" }}>
            {/* glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-2/3 -translate-x-1/2 rounded-full bg-cyan-500/30 blur-3xl" />
            <div className="absolute right-5 top-5 rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-black text-[#062a36]">
              Recommended
            </div>

            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">Best choice</div>
            <h2 className="mt-4 text-2xl font-black">Shield Monthly</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="mono-readout text-5xl font-black tracking-tight text-cyan-100">$4.99</span>
              <span className="text-base font-semibold text-white/50">/mo</span>
            </div>

            {/* per-day pill */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-500/10 px-3 py-1.5">
              <span className="mono-readout text-sm font-black text-cyan-200">$0.16/day</span>
              <span className="text-xs text-cyan-300/70">· unlimited scans</span>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/65">Unlimited protection, billed every month.</p>

            <div className="mt-6 space-y-2.5">
              {["Unlimited full checks", "Forensic report unlocked", "Case-aware follow-up chat", "3-day free trial"].map((p) => (
                <div key={p} className="flex items-center gap-3 rounded-xl border border-cyan-300/15 bg-cyan-500/10 px-4 py-3 text-sm text-white/85">
                  <CheckIcon size={14} className="flex-shrink-0 text-cyan-300" />
                  {p}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleClick("monthly")}
              disabled={pending !== null}
              className="press mt-8 w-full rounded-2xl bg-cyan-100 px-5 py-4 text-sm font-black text-[#062a36] transition hover:bg-white disabled:opacity-60"
            >
              {pending === "monthly" ? "Redirecting..." : "Start free trial"}
            </button>
          </div>

          {/* Yearly — most promoted */}
          <div className="fade-in-up relative overflow-hidden rounded-[32px] p-[1.5px] bg-gradient-to-b from-amber-400/70 via-amber-300/40 to-transparent"
            style={{ animationDelay: "180ms" }}>
            {/* inner card */}
            <div className="relative h-full rounded-[30px] bg-gradient-to-b from-[#1a1205] to-[#04080d] p-6 md:p-8">
              {/* top glow */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-2/3 -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl" />

              {/* 50% OFF badge — big and prominent */}
              <div className="absolute -right-3 -top-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-amber-900 shadow-lg shadow-amber-500/40">
                50%<br />OFF
              </div>

              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/70">Best value</div>
              <h2 className="mt-4 text-2xl font-black">Shield Yearly</h2>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="mono-readout text-5xl font-black tracking-tight text-amber-100">$29.99</span>
                <span className="text-base font-semibold text-white/50">/yr</span>
              </div>

              {/* crossed-out monthly price */}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-white/35 line-through">$59.88/yr</span>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-300">you save $29.89</span>
              </div>

              {/* per-day pill */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-1.5">
                <span className="mono-readout text-sm font-black text-amber-200">$0.08/day</span>
                <span className="text-xs text-amber-300/70">· unlimited scans</span>
              </div>

              <p className="mt-3 text-sm leading-6 text-white/65">Full year of protection — half the monthly price.</p>

              <div className="mt-6 space-y-2.5">
                {["Everything in Monthly", "Save 50% vs monthly ($59.88)", "Priority support", "3-day free trial"].map((p) => (
                  <div key={p} className="flex items-center gap-3 rounded-xl border border-amber-400/15 bg-amber-500/8 px-4 py-3 text-sm text-white/85">
                    <CheckIcon size={14} className="flex-shrink-0 text-amber-300" />
                    {p}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleClick("yearly")}
                disabled={pending !== null}
                className="press mt-8 w-full rounded-2xl bg-amber-400 px-5 py-4 text-sm font-black text-amber-900 transition hover:bg-amber-300 disabled:opacity-60 shadow-lg shadow-amber-500/30"
              >
                {pending === "yearly" ? "Redirecting..." : "Claim 50% off — Start free trial"}
              </button>
            </div>
          </div>
        </div>

        {/* Value comparison row */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: <StarIcon size={24} />, label: "Monthly plan", value: "$0.16/day", note: "Less than 1/10 of a coffee" },
            { icon: <BoltIcon size={24} />, label: "Yearly plan", value: "$0.08/day", note: "Half the monthly price" },
            { icon: <ShieldIcon size={24} />, label: "Single check", value: "$0.99", note: "No subscription needed" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-2xl p-5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-200">{stat.icon}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">{stat.label}</div>
              <div className="mono-readout mt-1 text-2xl font-black text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-white/50">{stat.note}</div>
            </div>
          ))}
        </div>

        {/* Trial info */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 p-6 text-sm text-white/60 md:p-8">
          <strong className="text-white">How the trial works:</strong> All subscriptions start with a 3-day free trial.
          You won&apos;t be charged during the trial. If you don&apos;t cancel before it ends, your card will be
          automatically billed at the listed price and renewed each cycle. You can cancel anytime from your account.
        </div>
      </div>
    </main>
  );
}
