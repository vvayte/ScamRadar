"use client";

import * as React from "react";
import { Icon } from "../Icon";
import ScoreRing from "./ScoreRing";

export interface CheckerReason {
  title: string;
  detail?: string;
}

export interface CheckerResult {
  score: number;
  risk: "low" | "med" | "high";
  title: string;
  summary: string;
  reasons: CheckerReason[];
  action: string;
}

interface ResultViewProps {
  result: CheckerResult;
  onReset: () => void;
}

const LABEL: Record<CheckerResult["risk"], string> = {
  low: "Low risk",
  med: "Medium risk",
  high: "High risk",
};

export function ResultView({ result, onReset }: ResultViewProps): React.JSX.Element {
  const r = result;
  const bgVar = `var(--risk-${r.risk}-bg)`;
  const lineVar = `var(--risk-${r.risk}-line)`;

  const handleCopy = async () => {
    try {
      const text = [
        "ScamRadar report",
        `Risk: ${LABEL[r.risk]} (score ${r.score})`,
        `Title: ${r.title}`,
        `Summary: ${r.summary}`,
        "Reasons:",
        ...r.reasons.map((rs, i) => `  ${i + 1}. ${rs.title}${rs.detail ? ` — ${rs.detail}` : ""}`),
        `Action: ${r.action}`,
      ].join("\n");
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      {/* Risk header */}
      <div
        style={{
          padding: 24,
          background: bgVar,
          borderBottom: `1px solid ${lineVar}`,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <ScoreRing score={r.score} level={r.risk} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <span className={`badge-risk ${r.risk}`} style={{ marginBottom: 8 }}>
            <Icon name={r.risk === "low" ? "check" : "alert"} size={12} strokeWidth={2.4} />
            {LABEL[r.risk]}
          </span>
          <div
            style={{
              fontWeight: 600,
              fontSize: 18,
              color: "var(--ink-1)",
              letterSpacing: "-0.01em",
              marginTop: 8,
            }}
          >
            {r.title}
          </div>
          <div className="t-body-sm" style={{ marginTop: 4 }}>
            {r.summary}
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div style={{ padding: 24 }}>
        <div className="t-label" style={{ marginBottom: 12 }}>
          Top {r.reasons.length} reason{r.reasons.length === 1 ? "" : "s"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {r.reasons.map((reason, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: 14,
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                borderRadius: "var(--r-md)",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--surface)",
                  border: "1px solid var(--hairline-strong)",
                  color: "var(--ink-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-1)" }}>
                  {reason.title}
                </div>
                {reason.detail ? (
                  <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
                    {reason.detail}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Recommended action */}
        {r.action ? (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: "var(--ink-1)",
              color: "white",
              borderRadius: "var(--r-md)",
              display: "flex",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="bolt" size={14} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  marginBottom: 4,
                }}
              >
                Recommended action
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{r.action}</div>
            </div>
          </div>
        ) : null}

        {/* Secondary actions */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--hairline)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopy}>
            <Icon name="copy" size={14} strokeWidth={2} /> Copy report
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
            <Icon name="bookmark" size={14} strokeWidth={2} /> Save
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
            <Icon name="flag" size={14} strokeWidth={2} /> Report scam
          </button>
          <div style={{ flex: 1 }} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            New check <Icon name="arrowRight" size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultView;
