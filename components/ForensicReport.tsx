"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ScamResult } from "./ResultCard";
import type { AnalysisArtifact } from "@/lib/analysisArtifacts";
import { matchPlaybook, type Playbook } from "@/lib/playbooks";

type Props = {
  result: ScamResult;
  input: string;
  artifacts: AnalysisArtifact[];
  signalExplanations: string[];
  partial?: boolean;
};

const RECOVERY_BY_LEVEL: Record<string, { title: string; steps: string[] }> = {
  High: {
    title: "Urgent recovery plan",
    steps: [
      "Do not send any payment or share card / ID info from this thread.",
      "Screenshot the full conversation, including sender handle and timestamps.",
      "If you already paid by card: call your bank within 24h and dispute the charge.",
      "Report to the platform (eBay / Facebook / OLX) and to a national body (FTC / Action Fraud / NCSC).",
      "Block the sender and forward suspicious SMS to 7726 to help carriers take it down.",
    ],
  },
  Medium: {
    title: "Verification checklist",
    steps: [
      "Verify the counter-party through a second channel (official profile, phone, platform DM).",
      "Inspect the URL/domain carefully before entering any data.",
      "Insist on platform-native escrow / payment — refuse alternatives.",
      "Wait 24h before any financial action if anything feels rushed.",
    ],
  },
  Low: {
    title: "Light-touch monitoring",
    steps: [
      "No immediate action needed. The signals look benign.",
      "Add this seller / domain to your watchlist if you'll deal with them again.",
      "If context changes (urgency, new payment method, domain swap), re-run the check.",
    ],
  },
};

function RiskChip({ level }: { level: "Low" | "Medium" | "High" }) {
  const color =
    level === "High"
      ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
      : level === "Medium"
        ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
        : "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${color}`}>{level}</span>;
}

export default function ForensicReport({
  result,
  input,
  artifacts,
  signalExplanations,
  partial = false,
}: Props) {
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

  const checkedArtifacts = artifacts.filter((a) => a.status === "checked");
  const unavailableArtifact = artifacts.find((a) => a.status !== "checked");

  return (
    <div className="fade-in-up overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Forensic report</div>
            <div className="mt-1 text-base font-semibold text-white">Detailed breakdown</div>
          </div>
          <RiskChip level={level} />
        </div>
      </div>

      {/* SIGNAL BREAKDOWN */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            1 · Signal breakdown
          </div>
          <span className="text-xs text-white/45">
            {result.reasons?.length || 0} {result.reasons?.length === 1 ? "signal" : "signals"}
          </span>
        </div>
        <div className="space-y-2">
          {(result.reasons || []).map((reason, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedReason(expandedReason === idx ? null : idx)}
              className="w-full rounded-xl border border-white/8 bg-black/25 p-4 text-left transition hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mono-readout mt-0.5 rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] font-bold text-white/70">
                    #{idx + 1}
                  </span>
                  <span className="text-sm text-white/85">{reason}</span>
                </div>
                <span className="text-xs text-white/35">{expandedReason === idx ? "–" : "+"}</span>
              </div>
              {expandedReason === idx ? (
                <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-6 text-white/65">
                  {signalExplanations[idx] || "ScamRadar surfaced this as a contributing factor to the overall risk score."}
                </div>
              ) : null}
            </button>
          ))}
          {(result.reasons || []).length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-black/25 p-4 text-sm text-white/55">
              No specific signals were detected in this submission.
            </div>
          ) : null}
        </div>
      </div>

      {/* PLAYBOOK MATCH */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            2 · Scam playbook match
          </div>
          {playbook ? <RiskChip level="High" /> : null}
        </div>
        {!playbook ? (
          <div className="rounded-xl border border-white/8 bg-black/25 p-4 text-sm text-white/55">
            No high-confidence match against tracked scam playbooks.
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <div className="text-base font-bold text-white">{playbook.name}</div>
            <div className="mt-1 text-xs text-white/55">
              {playbook.prevalence} · typical loss {playbook.typicalLoss}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/75">{playbook.summary}</p>
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">How it unfolds</div>
              <ol className="mt-2 space-y-1.5">
                {playbook.stages.map((stage, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/75">
                    <span className="mono-readout mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-[10px] font-bold text-white/70">
                      {i + 1}
                    </span>
                    <span>{stage}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* NEXT STEPS */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          3 · {recovery.title}
        </div>
        <ol className="space-y-2">
          {recovery.steps.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/25 px-4 py-3 text-sm text-white/80"
            >
              <span className="mono-readout flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-[10px] font-bold text-white/70">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* FORENSIC ARTIFACTS — only what was actually checked */}
      <div className="px-5 py-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          4 · Forensic artifacts
        </div>
        {checkedArtifacts.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {checkedArtifacts.map((artifact, i) => (
              <div key={`${artifact.type}-${i}`} className="rounded-xl border border-white/8 bg-black/25 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {artifact.label}
                </div>
                <div className="mt-2 text-sm text-white/85">
                  {artifact.value || "—"}
                </div>
                {artifact.source ? (
                  <div className="mt-2 text-[10px] uppercase tracking-widest text-emerald-300/80">
                    Source · {artifact.source}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-black/25 p-4 text-sm text-white/55">
            {unavailableArtifact?.value || "No external lookups were available for this submission."}
          </div>
        )}
        <p className="mt-3 text-[11px] text-white/40">
          ScamRadar only displays forensic artifacts that were actually computed for this submission. Empty categories are omitted.
        </p>
      </div>

      {partial ? (
        <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4 text-center text-xs text-white/55">
          <Link href="/dashboard/billing" className="font-semibold text-white hover:underline">
            Upgrade to Shield →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
