import * as React from "react";

interface EyebrowLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function EyebrowLabel({ children, className = "" }: EyebrowLabelProps): React.JSX.Element {
  return <div className={`section-eyebrow ${className}`.trim()}>{children}</div>;
}

export default EyebrowLabel;
