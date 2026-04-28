import * as React from "react";
import EyebrowLabel from "./EyebrowLabel";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  align?: "left" | "center";
  maxWidth?: number;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  align = "left",
  maxWidth = 640,
  className = "",
}: SectionHeaderProps): React.JSX.Element {
  const isCenter = align === "center";
  return (
    <div
      className={className}
      style={{
        maxWidth,
        marginBottom: 56,
        textAlign: isCenter ? "center" : "left",
        marginLeft: isCenter ? "auto" : undefined,
        marginRight: isCenter ? "auto" : undefined,
      }}
    >
      {eyebrow ? <EyebrowLabel>{eyebrow}</EyebrowLabel> : null}
      <h2 className="t-h2" style={{ margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

export default SectionHeader;
