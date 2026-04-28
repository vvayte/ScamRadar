import * as React from "react";
import { Icon } from "../Icon";
import TrustPills from "./TrustPills";

interface HeroProps {
  children: React.ReactNode;
}

export function Hero({ children }: HeroProps): React.JSX.Element {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div className="subtle-grad" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <div
        className="container hero-grid"
        style={{ position: "relative", paddingTop: 72, paddingBottom: 96 }}
      >
        <div>
          <div className="pill pill-soft" style={{ marginBottom: 24 }}>
            <span className="pill-dot" />
            New · Image OCR for screenshots
          </div>
          <h1 className="t-display" style={{ margin: 0, color: "var(--ink-1)" }}>
            Know before
            <br />
            you pay.
            <span
              className="t-serif"
              style={{
                display: "block",
                color: "var(--brand-700)",
                fontSize: "0.95em",
                marginTop: 4,
              }}
            >
              A scam check in 2 seconds.
            </span>
          </h1>
          <p className="t-body-lg" style={{ marginTop: 20, marginBottom: 0, maxWidth: 460 }}>
            Paste a suspicious message, link, or screenshot. Get a clear risk score with the reasons
            behind it.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
            <a href="#checker-card" className="btn btn-brand btn-lg">
              Run free check <Icon name="arrowRight" size={16} strokeWidth={2.2} />
            </a>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              <Icon name="play" size={14} strokeWidth={2} /> See how it works
            </a>
          </div>
          <TrustPills />
        </div>
        <div>{children}</div>
      </div>
      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 32px;
            padding-top: 24px !important;
            padding-bottom: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;
