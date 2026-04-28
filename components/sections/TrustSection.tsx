import * as React from "react";
import { Icon, type IconName } from "../Icon";

const PROMISES: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "lock", title: "Private by default", body: "We never sell or share what you check." },
  { icon: "fingerprint", title: "Local-first history", body: "Your past checks stay in your browser." },
  { icon: "eye", title: "No account needed", body: "Try a check without signing up. Ever." },
];

export function TrustSection(): React.JSX.Element {
  return (
    <section
      className="section"
      style={{ background: "var(--ink-1)", color: "white" }}
      id="trust"
    >
      <div className="container">
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <div className="section-eyebrow" style={{ color: "var(--brand-300)" }}>
            Why trust ScamRadar
          </div>
          <h2 className="t-h2" style={{ margin: 0, color: "white" }}>
            A safety tool that respects your safety.
          </h2>
        </div>
        <div className="trust-grid">
          {PROMISES.map((p) => (
            <div
              key={p.title}
              style={{
                padding: 28,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "var(--r-lg)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(22,160,107,0.15)",
                  color: "var(--brand-300)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Icon name={p.icon} size={18} strokeWidth={1.75} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: "white" }}>
                {p.title}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>
                {p.body}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .trust-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .trust-grid { grid-template-columns: 1fr; gap: 16px; } }
      `}</style>
    </section>
  );
}

export default TrustSection;
