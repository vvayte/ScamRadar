"use client";

import * as React from "react";
import { Icon } from "../Icon";

const ITEMS = [
  {
    q: "Is ScamRadar really free?",
    a: "Yes — your first checks are free with no signup. Pro unlocks unlimited checks, screenshot OCR, and saved history.",
  },
  {
    q: "How accurate is the risk score?",
    a: "We combine URL inspection, lookalike-domain detection, OCR, and pattern-matching against known fraud archives. The score reflects confidence; we always show the reasons so you can judge for yourself.",
  },
  {
    q: "Do you store what I check?",
    a: "By default, your check history stays in your browser only. Pro users can opt in to encrypted cloud sync. We never sell or share your data.",
  },
  {
    q: "Does it work for screenshots in other languages?",
    a: "OCR supports 30+ languages. Pattern detection currently works best in English, Spanish, and Polish, with more rolling out monthly.",
  },
  {
    q: "Can I integrate ScamRadar with my own app or bot?",
    a: "Yes — Pro includes API access and a Telegram/Discord bot wrapper for routing reports.",
  },
];

export function FAQ(): React.JSX.Element {
  const [open, setOpen] = React.useState<number>(0);
  return (
    <section
      className="section"
      id="faq"
      style={{
        background: "var(--surface-2)",
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div className="container-tight">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-eyebrow">FAQ</div>
          <h2 className="t-h2" style={{ margin: 0 }}>
            Quick answers.
          </h2>
        </div>
        <div className="card" style={{ padding: 8 }}>
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: i === 0 ? 0 : "1px solid var(--hairline)" }}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "20px 20px",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    fontFamily: "inherit",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--ink-1)",
                  }}
                  aria-expanded={isOpen}
                >
                  {it.q}
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--surface-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-2)",
                      transform: isOpen ? "rotate(45deg)" : "",
                      transition: "transform 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="plus" size={14} strokeWidth={2.2} />
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 20px 20px",
                      color: "var(--ink-2)",
                      fontSize: 15,
                      lineHeight: 1.6,
                      maxWidth: 720,
                    }}
                  >
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
