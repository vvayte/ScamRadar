"use client";

import * as React from "react";

interface ScoreRingProps {
  score: number;
  level: "low" | "med" | "high";
  size?: number;
}

const CIRC = 238.76; // 2 * Pi * 38

export function ScoreRing({ score, level, size = 88 }: ScoreRingProps): React.JSX.Element {
  const colorVar = `var(--risk-${level}-solid)`;
  const lineVar = `var(--risk-${level}-line)`;
  const inkVar = `var(--risk-${level}-ink)`;
  const dash = CIRC * Math.max(0, Math.min(1, score / 100));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 88 88"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="44" cy="44" r="38" stroke={lineVar} strokeWidth="6" fill="none" />
        <circle
          cx="44"
          cy="44"
          r="38"
          stroke={colorVar}
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${dash} ${CIRC}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: inkVar,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{score}</div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.1em",
            marginTop: 2,
            textTransform: "uppercase",
          }}
        >
          Score
        </div>
      </div>
    </div>
  );
}

export default ScoreRing;
