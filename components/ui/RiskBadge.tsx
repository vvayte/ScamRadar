import * as React from "react";
import { Icon } from "../Icon";

interface RiskBadgeProps {
  level: "low" | "med" | "high";
  label?: string;
  className?: string;
}

const LABELS: Record<RiskBadgeProps["level"], string> = {
  low: "Low risk",
  med: "Medium risk",
  high: "High risk",
};

export function RiskBadge({ level, label, className = "" }: RiskBadgeProps): React.JSX.Element {
  return (
    <span className={`badge-risk ${level} ${className}`.trim()}>
      <Icon name={level === "low" ? "check" : "alert"} size={12} strokeWidth={2.4} />
      {label || LABELS[level]}
    </span>
  );
}

export default RiskBadge;
