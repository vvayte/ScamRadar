import * as React from "react";
import { Icon, type IconName } from "../Icon";

const STEPS: Array<{ num: string; title: string; body: string; icon: IconName }> = [
  { num: "01", title: "Paste it in", body: "Drop a message, link, or screenshot. No signup.", icon: "paste" },
  {
    num: "02",
    title: "We analyze",
    body: "URL inspection, OCR, lookalike-domain checks, fraud-pattern matching.",
    icon: "radar",
  },
  { num: "03", title: "You decide", body: "Get a risk score, top reasons, and a clear next step.", icon: "shield" },
];

export function HowItWorks(): React.JSX.Element {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div style={{ maxWidth: 640, marginBottom: 56 }}>
          <div className="section-eyebrow">How it works</div>
          <h2 className="t-h2" style={{ margin: 0 }}>
            Three steps. About two seconds.
          </h2>
        </div>
        <div className="grid-3">
          {STEPS.map((s) => (
            <div key={s.num} className="card" style={{ padding: 28, position: "relative" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--brand-50)",
                  color: "var(--brand-700)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Icon name={s.icon} size={20} strokeWidth={1.75} />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 28,
                  right: 28,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-4)",
                }}
              >
                {s.num}
              </div>
              <h3 className="t-h4" style={{ margin: 0, marginBottom: 6 }}>
                {s.title}
              </h3>
              <p className="t-body-sm" style={{ margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 768px) { .grid-3 { grid-template-columns: 1fr; gap: 16px; } }
      `}</style>
    </section>
  );
}

export default HowItWorks;
