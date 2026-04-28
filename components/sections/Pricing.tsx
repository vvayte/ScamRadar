import * as React from "react";
import Link from "next/link";
import { Icon } from "../Icon";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    sub: "forever",
    features: ["2 checks per day", "Text & link checks", "Basic results"],
    cta: "Start free",
    primary: false,
    href: "/",
  },
  {
    name: "Pro",
    price: "$6",
    sub: "per month",
    features: ["Unlimited checks", "Screenshot + OCR", "Saved history & exports", "Bot API access"],
    cta: "Get Pro",
    primary: true,
    href: "/pricing",
  },
];

export function Pricing(): React.JSX.Element {
  return (
    <section className="section" id="pricing">
      <div className="container-tight">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-eyebrow">Pricing</div>
          <h2 className="t-h2" style={{ margin: 0 }}>
            Free for casual checks. Pro when you need more.
          </h2>
        </div>
        <div className="pricing-grid">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={p.primary ? "card-elevated" : "card"}
              style={{
                padding: 32,
                borderColor: p.primary ? "var(--ink-1)" : undefined,
                borderWidth: p.primary ? 1.5 : 1,
                position: "relative",
              }}
            >
              {p.primary && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: 24,
                    background: "var(--ink-1)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "var(--r-pill)",
                  }}
                >
                  Most popular
                </div>
              )}
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  marginTop: 12,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {p.price}
                </span>
                <span className="t-body-sm">{p.sub}</span>
              </div>
              <hr className="divider" style={{ margin: "20px 0" }} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {p.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 14,
                      color: "var(--ink-2)",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "var(--brand-50)",
                        color: "var(--brand-700)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="check" size={11} strokeWidth={3} />
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href={p.href}
                className={`btn ${p.primary ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%" }}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) { .pricing-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

export default Pricing;
