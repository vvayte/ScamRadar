"use client";

import * as React from "react";
import { Icon } from "../Icon";

interface AnalyzeButtonProps {
  analyzing: boolean;
  progress: number;
  disabled?: boolean;
  onClick: () => void;
}

export function AnalyzeButton({ analyzing, progress, disabled, onClick }: AnalyzeButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      className="btn btn-brand btn-lg"
      onClick={onClick}
      disabled={disabled || analyzing}
      style={{ flex: 1, minWidth: 200, position: "relative", overflow: "hidden" }}
      aria-busy={analyzing}
    >
      {analyzing ? (
        <>
          <span
            aria-hidden="true"
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "white",
              animation: "spin 0.7s linear infinite",
              display: "inline-block",
            }}
          />
          Analyzing… {Math.round(progress * 100)}%
        </>
      ) : (
        <>
          <Icon name="sparkle" size={16} strokeWidth={2} />
          Analyze
        </>
      )}
    </button>
  );
}

export default AnalyzeButton;
