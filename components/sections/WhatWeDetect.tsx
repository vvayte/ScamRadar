import * as React from "react";
import { Icon, type IconName } from "../Icon";

const ITEMS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "globe", title: "Lookalike domains", body: "Homoglyphs, digit swaps, IDN tricks." },
  { icon: "coin", title: "Payment-flow scams", body: "Off-platform asks, wire and crypto pressure." },
  { icon: "image", title: "Screenshot OCR", body: "Reads chats, listings, payment screens." },
  { icon: "cards", title: "Stolen-listing reuse", body: "Reverse-image checks against fraud archives." },
  { icon: "fingerprint", title: "Lookalike characters", body: 'Spots "1" for "l", "0" for "o".' },
  { icon: "bolt", title: "Urgency tactics", body: "Pressure language and time-bound threats." },
];

export function WhatWeDetect(): React.JSX.Element {
  return (
    <section
      className="section"
      style={{
        background: "var(--surface-2)",
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
      }}
      id="product"
    >
      <div className="container">
        <div style={{ maxWidth: 640, marginBottom: 56 }}>
          <div className="section-eyebrow">What ScamRadar catches</div>
          <h2 className="t-h2" style={{ margin: 0 }}>
            Six fraud patterns. One quick check.
          </h2>
        </div>
        <div className="detect-grid">
          {ITEMS.map((it) => (
            <div key={it.title} className="card" style={{ padding: 24 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--surface-3)",
                  color: "var(--ink-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name={it.icon} size={18} strokeWidth={1.75} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: "var(--ink-1)" }}>
                {it.title}
              </div>
              <div className="t-body-sm" style={{ margin: 0 }}>
                {it.body}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .detect-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .detect-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .detect-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

export default WhatWeDetect;
