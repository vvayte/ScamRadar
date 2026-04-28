"use client";

import * as React from "react";
import { Icon } from "../Icon";

export type SampleKey = "marketplace" | "job" | "safe";

interface ExamplesProps {
  onTry?: (key: SampleKey) => void;
}

const ITEMS: Array<{
  tag: string;
  risk: "low" | "med" | "high";
  title: string;
  quote: string;
  sample: SampleKey;
}> = [
  {
    tag: "Marketplace",
    risk: "high",
    title: "Courier with upfront delivery fee",
    quote: '"I\'ll send a courier — pay $45 shipping first."',
    sample: "marketplace",
  },
  {
    tag: "Job offer",
    risk: "high",
    title: "Remote role paid in crypto wallet",
    quote: '"Send 0.005 BTC to receive your onboarding kit."',
    sample: "job",
  },
  {
    tag: "Marketplace",
    risk: "low",
    title: "Buyer pays through platform escrow",
    quote: '"Happy to use the marketplace\'s secure checkout."',
    sample: "safe",
  },
];

export function Examples({ onTry }: ExamplesProps): React.JSX.Element {
  return (
    <section className="section">
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 56,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div className="section-eyebrow">Real scams we&apos;ve caught</div>
            <h2 className="t-h2" style={{ margin: 0 }}>
              Try a sample. See the breakdown.
            </h2>
          </div>
          <a href="/examples" className="btn btn-secondary btn-sm">
            View all <Icon name="arrowRight" size={14} strokeWidth={2} />
          </a>
        </div>
        <div className="examples-grid">
          {ITEMS.map((it, i) => (
            <button
              key={i}
              type="button"
              className="card example-card"
              onClick={() => onTry?.(it.sample)}
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                textAlign: "left",
                background: "var(--surface)",
                font: "inherit",
                color: "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span className="t-label">{it.tag}</span>
                <span className={`badge-risk ${it.risk}`}>
                  {it.risk === "high" ? "High" : it.risk === "med" ? "Medium" : "Low"}
                </span>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 12,
                  color: "var(--ink-1)",
                  letterSpacing: "-0.005em",
                }}
              >
                {it.title}
              </div>
              <div
                className="t-serif"
                style={{
                  fontSize: 17,
                  color: "var(--ink-2)",
                  lineHeight: 1.45,
                  flex: 1,
                }}
              >
                {it.quote}
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid var(--hairline)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--brand-700)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Try this example <Icon name="arrowRight" size={13} strokeWidth={2.4} />
              </div>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .examples-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .examples-grid { grid-template-columns: 1fr; } }
        .example-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
      `}</style>
    </section>
  );
}

export default Examples;
