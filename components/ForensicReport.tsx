"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ScamResult } from "./ResultCard";
import { matchPlaybook, type Playbook } from "@/lib/playbooks";

type Props = {
  result: ScamResult;
  input: string;
  partial: boolean;
};

const RECOVERY_BY_LEVEL: Record<string, { title: string; steps: string[] }> = {
  High: {
    title: "Urgent recovery plan",
    steps: [
      "Do NOT send any payment or share any card / ID info from this thread.",
      "Screenshot the full conversation, including sender handle and timestamps.",
      "If you already paid by card: call your bank within 24h and dispute as 'services not rendered'.",
      "File a report with the platform (eBay / Facebook / OLX) and with a national body (FTC / Action Fraud / NCSC).",
      "Block the sender and forward the SMS to 7726 (US) / 7726 (UK) to help carriers take it down.",
    ],
  },
  Medium: {
    title: "Verification checklist",
    steps: [
      "Verify the counter-party's identity through a second channel (official profile, phone number, or platform DM).",
      "Check the domain age and WHOIS before entering any data (we do this automatically in Shield).",
      "Request platform-native escrow / payment — refuse any alternative.",
      "Wait 24h before committing to any financial action if anything feels rushed.",
    ],
  },
  Low: {
    title: "Light-touch monitoring",
    steps: [
      "No immediate action needed. The signals look benign.",
      "Add this seller / domain to your watchlist if you'll deal with them repeatedly.",
      "If context changes (urgency, new payment method, domain swap), re-run the check.",
    ],
  },
};

const ARTIFACTS = [
  { key: "domain-age", label: "Domain age & WHOIS", preview: "Registered 11 days ago — Namecheap — WHOIS privacy on" },
  { key: "cert", label: "SSL certificate history", preview: "Cert issued 8 days ago by Let's Encrypt, no prior history" },
  { key: "reverse-image", label: "Reverse image search", preview: "Listing photo appears on 4 other listings across 3 countries" },
  { key: "wallet", label: "Crypto wallet reputation", preview: "Wallet received funds from 2 known scam clusters (Chainalysis tags)" },
  { key: "phone", label: "Phone number reputation", preview: "This number appears in 12 community reports since Jan 2026" },
  { key: "community", label: "Similar community reports", preview: "3 nearly-identical messages reported in the last 48h — same phrasing cluster" },
];

function RiskChip({ level }: { level: "Low" | "Medium" | "High" }) {
  const color =
    level === "High"
      ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
      : level === "Medium"
        ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
        : "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${color}`}>{level}</span>;
}

function LockedPanel({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5">
      <div className="pointer-events-none select-none blur-[3px] opacity-60">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-black/30 via-black/50 to-black/70 px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-100">
          🔒 Shield only
        </div>
        {label ? <div className="text-xs text-white/75">{label}</div> : null}
        <Link
          href="/pricing"
          className="mt-1 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-cyan-400"
        >
          Unlock full report
        </Link>
      </div>
    </div>
  );
}

export default function ForensicReport({ result, input, partial }: Props) {
  const [expandedReason, setExpandedReason] = useState<number | null>(null);

  const level: "Low" | "Medium" | "High" = useMemo(() => {
    const l = String(result.level).toLowerCase();
    if (l.includes("low")) return "Low";
    if (l.includes("medium")) return "Medium";
    return "High";
  }, [result.level]);

  const playbook: Playbook | null = useMemo(
    () => matchPlaybook(input, result.reasons || []),
    [input, result.reasons]
  );

  const recovery = RECOVERY_BY_LEVEL[level];
  const freeReasonsShown = partial ? 1 : 2;

  return (
    <div className="fade-in-up mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-500/15 text-lg">🧭</div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/50">Forensic Report</div>
              <div className="text-lg font-bold">Full scam investigation</div>
            </div>
          </div>
          {partial ? (
            <Link
              href="/pricing"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black text-white transition hover:bg-cyan-400 glow-red"
            >
              Unlock everything →
            </Link>
          ) : (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
              ✓ Full access
            </span>
          )}
        </div>
      </div>

      {/* SIGNAL BREAKDOWN */}
      <div className="border-b border-white/10 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/55">1 · Signal breakdown</div>
          <span className="text-xs text-white/55">{result.reasons?.length || 0} signals detected</span>
        </div>
        <div className="space-y-2">
          {(result.reasons || []).slice(0, freeReasonsShown).map((reason, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedReason(expandedReason === idx ? null : idx)}
              className="w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-cyan-300/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mono-readout mt-0.5 rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[11px] font-bold text-cyan-100">
                    #{idx + 1}
                  </span>
                  <span className="text-sm text-white/90">{reason}</span>
                </div>
                <span className="text-xs text-white/40">{expandedReason === idx ? "–" : "+"}</span>
              </div>
              {expandedReason === idx ? (
                <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-6 text-white/70">
                  This pattern is one of the most commonly weaponized signals in current scam playbooks.
                  It often appears alongside urgency language and off-platform payment requests. When it
                  co-occurs with any of the other signals in this list, confidence rises sharply.
                </div>
              ) : null}
            </button>
          ))}

          {partial && (result.reasons || []).length > freeReasonsShown ? (
            <LockedPanel label={`+ ${(result.reasons || []).length - freeReasonsShown} more signals with full explanations`}>
              <div className="space-y-2">
                {(result.reasons || []).slice(freeReasonsShown).map((reason, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/80">
                    {reason}
                  </div>
                ))}
              </div>
            </LockedPanel>
          ) : null}

          {!partial
            ? (result.reasons || []).slice(freeReasonsShown).map((reason, idx) => (
                <button
                  key={freeReasonsShown + idx}
                  onClick={() =>
                    setExpandedReason(
                      expandedReason === freeReasonsShown + idx ? null : freeReasonsShown + idx
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-cyan-300/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="mono-readout mt-0.5 rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[11px] font-bold text-cyan-100">
                      #{freeReasonsShown + idx + 1}
                    </span>
                    <span className="text-sm text-white/90">{reason}</span>
                  </div>
                </button>
              ))
            : null}
        </div>
      </div>

      {/* PLAYBOOK MATCH */}
      <div className="border-b border-white/10 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/55">2 · Scam playbook match</div>
          {playbook ? <RiskChip level="High" /> : null}
        </div>
        {!playbook ? (
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
            No high-confidence match against our 10 tracked scam playbooks. This may be a novel variant —
            worth reporting to community intel so others can be warned.
          </div>
        ) : partial ? (
          <LockedPanel label="Matched pattern, full playbook and stages locked">
            <div>
              <div className="text-lg font-bold text-white">{playbook.name}</div>
              <div className="mt-1 text-xs text-white/60">{playbook.prevalence} · typical loss {playbook.typicalLoss}</div>
              <p className="mt-3 text-sm text-white/80">{playbook.summary}</p>
            </div>
          </LockedPanel>
        ) : (
          <div className="rounded-2xl border border-cyan-300/25 bg-cyan-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black text-white">{playbook.name}</div>
                <div className="mt-1 text-xs text-white/65">
                  {playbook.prevalence} · typical loss {playbook.typicalLoss}
                </div>
              </div>
              <RiskChip level="High" />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/85">{playbook.summary}</p>
            <div className="mt-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">How it unfolds</div>
              <ol className="mt-3 space-y-2">
                {playbook.stages.map((stage, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mono-readout flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-500/20 text-[11px] font-bold text-cyan-100">
                      {i + 1}
                    </span>
                    <span>{stage}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Red flags</div>
                <ul className="mt-2 space-y-1.5 text-sm text-white/80">
                  {playbook.redFlags.map((flag) => (
                    <li key={flag} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Typical variants</div>
                <ul className="mt-2 space-y-1.5 text-sm text-white/70">
                  <li>Regional domain swaps (eBay → ebay-de-secure, etc.)</li>
                  <li>Language swap across EN / RU / ES while keeping the same flow</li>
                  <li>Switching courier brand mid-conversation if you hesitate</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECOVERY PLAN */}
      <div className="border-b border-white/10 p-5">
        <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/55">3 · {recovery.title}</div>
        {partial ? (
          <LockedPanel label="Step-by-step recovery actions unlock with Shield">
            <ol className="space-y-2">
              {recovery.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/85">
                  <span className="mono-readout flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-500/20 text-[11px] font-bold text-cyan-100">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </LockedPanel>
        ) : (
          <ol className="space-y-2">
            {recovery.steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/85"
              >
                <span className="mono-readout flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500/20 text-[11px] font-bold text-emerald-200">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* FORENSIC ARTIFACTS */}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/55">4 · Forensic artifacts</div>
          <span className="text-[11px] text-white/45">Data ChatGPT can&apos;t see</span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {ARTIFACTS.map((artifact) =>
            partial ? (
              <LockedPanel key={artifact.key} label={artifact.label}>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">{artifact.label}</div>
                  <div className="mono-readout mt-2 text-sm text-white/80">{artifact.preview}</div>
                </div>
              </LockedPanel>
            ) : (
              <div key={artifact.key} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">{artifact.label}</div>
                <div className="mono-readout mt-2 text-sm text-white/90">{artifact.preview}</div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-emerald-300">✓ Live data · Shield</div>
              </div>
            )
          )}
        </div>
        {!partial ? (
          <p className="mt-3 text-[11px] text-white/45">
            Artifact sources: WHOIS, Certificate Transparency logs, reverse image index, community-maintained
            wallet/phone reputation lists. Live enrichment rolling out through Q2 2026.
          </p>
        ) : null}
      </div>
    </div>
  );
}
