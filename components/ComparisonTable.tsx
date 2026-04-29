"use client";

import Link from "next/link";

const FEATURES = [
  { label: "Scam risk score (0–100)", free: true, pro: true },
  { label: "Text / link / screenshot analysis", free: true, pro: true },
  { label: "Community threat intel", free: true, pro: true },
  { label: "Full reasons & next-step advice", free: "2 full checks", pro: "Always full" },
  { label: "Unlimited checks", free: false, pro: true },
  { label: "Priority AI lane (faster responses)", free: false, pro: true },
  { label: "Cloud sync across devices", free: "Limited", pro: "Full" },
  { label: "Export PDF reports", free: false, pro: true },
  { label: "Bot API (Telegram / WhatsApp)", free: "Rate-limited", pro: "Elevated quota" },
  { label: "Watchlist monitoring & alerts", free: "Local up to 50", pro: "Cloud up to 50" },
  { label: "Early access to new detectors", free: false, pro: true },
  { label: "Email & in-app support", free: false, pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <span className="text-emerald-300" aria-label="included">✓</span>;
  }
  if (value === false) {
    return <span className="text-white/30" aria-label="not included">—</span>;
  }
  return <span className="text-white/75">{value}</span>;
}

export default function ComparisonTable() {
  return (
    <div className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.22em] text-white/50">Plans compared</div>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Free vs. Shield</h2>
          <p className="mt-2 soft-muted">
            Start free, upgrade when you see value. Cancel anytime. No card needed to try.
          </p>
        </div>
        <Link
          href="/pricing"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-400"
        >
          View full pricing
        </Link>
      </div>

      {/* Desktop: table grid */}
      <div className="mt-6 hidden overflow-hidden rounded-3xl border border-white/10 md:block">
        <div className="grid grid-cols-[1.3fr_1fr_1fr] bg-black/40 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          <div className="px-5 py-4">Feature</div>
          <div className="px-5 py-4 border-l border-white/10">Free</div>
          <div className="relative px-5 py-4 border-l border-white/10 text-cyan-100">
            Shield — $5/mo
            <span className="absolute right-3 top-3 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-[#45090f]">
              Best
            </span>
          </div>
        </div>
        {FEATURES.map((row, index) => (
          <div
            key={row.label}
            className={`grid grid-cols-[1.3fr_1fr_1fr] text-sm ${index % 2 === 0 ? "bg-black/15" : "bg-black/25"}`}
          >
            <div className="px-5 py-4 text-white/85">{row.label}</div>
            <div className="px-5 py-4 border-l border-white/10"><Cell value={row.free} /></div>
            <div className="px-5 py-4 border-l border-white/10 bg-cyan-500/[0.05]"><Cell value={row.pro} /></div>
          </div>
        ))}
      </div>

      {/* Mobile: stacked cards */}
      <div className="mt-6 grid gap-4 md:hidden">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Free</div>
          <div className="mt-1 text-lg font-black text-white">$0 / mo</div>
          <ul className="mt-4 space-y-3 text-sm">
            {FEATURES.map((row) => (
              <li key={row.label} className="flex items-start justify-between gap-3 border-t border-white/5 pt-3 first:border-0 first:pt-0">
                <span className="text-white/80">{row.label}</span>
                <span className="shrink-0 text-right"><Cell value={row.free} /></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-2xl border border-cyan-300/30 bg-cyan-500/[0.07] p-5">
          <span className="absolute right-3 top-3 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-[#45090f]">
            Best
          </span>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Shield</div>
          <div className="mt-1 text-lg font-black text-white">$5 / mo</div>
          <ul className="mt-4 space-y-3 text-sm">
            {FEATURES.map((row) => (
              <li key={row.label} className="flex items-start justify-between gap-3 border-t border-white/5 pt-3 first:border-0 first:pt-0">
                <span className="text-white/80">{row.label}</span>
                <span className="shrink-0 text-right"><Cell value={row.pro} /></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
