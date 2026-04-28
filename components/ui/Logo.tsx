import * as React from "react";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 28 }: LogoProps): React.JSX.Element {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: "var(--ink-1)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          position: "relative",
        }}
        aria-hidden="true"
      >
        <svg
          width={size * 0.62}
          height={size * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" stroke="var(--brand-300)" />
        </svg>
      </div>
      <span
        style={{
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: "-0.01em",
          color: "var(--ink-1)",
        }}
      >
        ScamRadar
      </span>
    </div>
  );
}

export default Logo;
