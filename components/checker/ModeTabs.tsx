"use client";

import * as React from "react";
import { Icon, type IconName } from "../Icon";

export type CheckerMode = "message" | "link" | "screenshot";

interface ModeTabsProps {
  value: CheckerMode;
  onChange: (mode: CheckerMode) => void;
}

const TABS: Array<{ id: CheckerMode; label: string; icon: IconName }> = [
  { id: "message", label: "Message", icon: "msg" },
  { id: "link", label: "Link", icon: "link" },
  { id: "screenshot", label: "Screenshot", icon: "image" },
];

export function ModeTabs({ value, onChange }: ModeTabsProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        background: "var(--surface-3)",
        padding: 4,
        borderRadius: "var(--r-pill)",
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab-chip ${value === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
        >
          <Icon name={t.icon} size={14} strokeWidth={2} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default ModeTabs;
