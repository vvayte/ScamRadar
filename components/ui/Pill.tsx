import * as React from "react";

interface PillProps {
  children: React.ReactNode;
  soft?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Pill({ children, soft = false, icon, className = "" }: PillProps): React.JSX.Element {
  return (
    <span className={`pill${soft ? " pill-soft" : ""} ${className}`.trim()}>
      {icon ? <span style={{ display: "inline-flex" }}>{icon}</span> : <span className="pill-dot" />}
      {children}
    </span>
  );
}

export default Pill;
