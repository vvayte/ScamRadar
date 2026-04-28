"use client";

import * as React from "react";
import { Icon } from "../Icon";

interface DropZoneProps {
  fileName: string | null;
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DropZone({
  fileName,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  inputRef,
  onFileChange,
}: DropZoneProps): React.JSX.Element {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        minHeight: 168,
        border: `2px dashed ${dragging ? "var(--brand-500)" : "var(--hairline-strong)"}`,
        background: dragging ? "var(--brand-50)" : "var(--surface-2)",
        borderRadius: "var(--r-md)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        transition: "all 0.15s",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--brand-50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--brand-600)",
        }}
      >
        <Icon name="upload" size={20} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>
          {fileName || "Drop a screenshot or click to upload"}
        </div>
        <div className="t-body-sm" style={{ marginTop: 2 }}>
          PNG, JPG, WEBP up to 8 MB
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={onFileChange}
      />
    </div>
  );
}

export default DropZone;
