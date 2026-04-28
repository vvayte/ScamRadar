import * as React from "react";
import { Icon, type IconName } from "../Icon";

const PILLS: Array<{ icon: IconName; text: string }> = [
  { icon: "check", text: "No signup needed" },
  { icon: "lock", text: "Private by default" },
  { icon: "bolt", text: "Results in ~2s" },
];

export function TrustPills(): React.JSX.Element {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
      {PILLS.map((p) => (
        <div key={p.text} className="pill">
          <Icon name={p.icon} size={14} strokeWidth={2} />
          {p.text}
        </div>
      ))}
    </div>
  );
}

export default TrustPills;
