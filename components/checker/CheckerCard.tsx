"use client";

import * as React from "react";
import { Icon } from "../Icon";
import ModeTabs, { type CheckerMode } from "./ModeTabs";
import AnalyzeButton from "./AnalyzeButton";
import DropZone from "./DropZone";
import ResultView, { type CheckerResult, type CheckerReason } from "./ResultView";

const SAMPLE_TEXT: Record<string, string> = {
  marketplace:
    "Hi! I'd love to buy your iPhone. I'm out of town so I'll send a courier tomorrow — please pay the $45 shipping via this link first: fb-marketp1ace-delivery.co/confirm",
  job:
    "Congratulations! You've been selected for our part-time data-entry role at $680/week. To receive your onboarding kit, please send 0.005 BTC to wallet bc1q...",
  safe:
    "Hey, I can pick up the bike tomorrow at 3pm — happy to pay through the marketplace's secure checkout. Should I bring cash as backup just in case?",
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;

type Phase = "idle" | "analyzing" | "result";

type ApiResponse = {
  score: number;
  level: "Low" | "Medium" | "High";
  reasons: string[];
  advice: string;
  skipAI?: boolean;
};

function levelToRisk(level: string): "low" | "med" | "high" {
  const l = level.toLowerCase();
  if (l.startsWith("h")) return "high";
  if (l.startsWith("m")) return "med";
  return "low";
}

function deriveTitle(risk: "low" | "med" | "high"): string {
  if (risk === "high") return "Likely scam";
  if (risk === "med") return "Be cautious";
  return "Looks safe";
}

function deriveSummary(risk: "low" | "med" | "high"): string {
  if (risk === "high") return "This message contains multiple fraud signals.";
  if (risk === "med") return "Some signals look suspicious — check before paying.";
  return "No fraud signals detected in this message.";
}

function reasonStringToObject(s: string): CheckerReason {
  const trimmed = s.trim();
  // Try " — " first, then " - ", then ":"
  const dashLong = trimmed.indexOf(" — ");
  if (dashLong > 0) {
    return {
      title: trimmed.slice(0, dashLong).trim(),
      detail: trimmed.slice(dashLong + 3).trim(),
    };
  }
  const dashShort = trimmed.indexOf(" - ");
  if (dashShort > 0) {
    return {
      title: trimmed.slice(0, dashShort).trim(),
      detail: trimmed.slice(dashShort + 3).trim(),
    };
  }
  const colon = trimmed.indexOf(":");
  if (colon > 0) {
    return {
      title: trimmed.slice(0, colon).trim(),
      detail: trimmed.slice(colon + 1).trim(),
    };
  }
  return { title: trimmed };
}

function mapApiToResult(api: ApiResponse): CheckerResult {
  const risk = levelToRisk(api.level);
  const reasons: CheckerReason[] = (api.reasons || [])
    .filter((s) => typeof s === "string" && s.trim().length > 0)
    .slice(0, 5)
    .map(reasonStringToObject);
  return {
    score: api.score,
    risk,
    title: deriveTitle(risk),
    summary: deriveSummary(risk),
    reasons,
    action: api.advice || "",
  };
}

export interface CheckerCardHandle {
  loadSample: (text: string) => void;
  focus: () => void;
}

interface CheckerCardProps {
  initialMode?: CheckerMode;
  autorunSampleText?: string | null;
  onConsumed?: () => void;
  id?: string;
}

const CheckerCard = React.forwardRef<CheckerCardHandle, CheckerCardProps>(function CheckerCard(
  { initialMode = "message", autorunSampleText = null, onConsumed, id },
  ref
) {
  const [mode, setMode] = React.useState<CheckerMode>(initialMode);
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [result, setResult] = React.useState<CheckerResult | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState("");
  const [apiError, setApiError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useImperativeHandle(
    ref,
    (): CheckerCardHandle => ({
      loadSample: (t: string) => {
        setMode("message");
        setText(t);
        setPhase("idle");
        setResult(null);
        setApiError("");
        setTimeout(() => {
          textAreaRef.current?.focus();
        }, 0);
      },
      focus: () => textAreaRef.current?.focus(),
    }),
    []
  );

  // Autorun support — when the parent passes autorunSampleText, fill it and run.
  React.useEffect(() => {
    if (!autorunSampleText) return;
    setMode("message");
    setText(autorunSampleText);
    setPhase("idle");
    setResult(null);
    setApiError("");
    const t = setTimeout(() => {
      runAnalyze(autorunSampleText, "message");
      onConsumed?.();
    }, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorunSampleText]);

  const reset = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase("idle");
    setResult(null);
    setText("");
    setFile(null);
    setFileError("");
    setApiError("");
    setProgress(0);
  };

  const validateFile = (f: File): string => {
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      return "Unsupported file type. Use PNG, JPG, or WEBP.";
    }
    if (f.size > MAX_FILE_BYTES) {
      return "File is over 8 MB. Try a smaller screenshot.";
    }
    return "";
  };

  const acceptFile = (f: File) => {
    const err = validateFile(f);
    setFileError(err);
    if (err) {
      setFile(null);
      return;
    }
    setFile(f);
    setMode("screenshot");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) {
      const f = item.getAsFile();
      if (f) {
        e.preventDefault();
        acceptFile(f);
      }
    }
  };

  const canAnalyze =
    phase !== "analyzing" &&
    (mode === "screenshot" ? !!file : text.trim().length >= 4);

  const runAnalyze = async (overrideText?: string, overrideMode?: CheckerMode) => {
    const useText = overrideText !== undefined ? overrideText : text;
    const useMode = overrideMode || mode;
    setApiError("");
    setPhase("analyzing");
    setProgress(0);

    const start = Date.now();
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const t = Math.min(0.85, (Date.now() - start) / 1600);
      setProgress(t);
    }, 50);

    try {
      let response: Response;
      if (useMode === "screenshot" && file) {
        const fd = new FormData();
        if (useText) fd.append("text", useText);
        fd.append("image", file);
        response = await fetch("/api/check", { method: "POST", body: fd });
      } else {
        response = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: useText }),
        });
      }

      const data = await response.json().catch(() => ({}));

      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }

      if (!response.ok) {
        setProgress(0);
        setPhase("idle");
        setApiError(
          (data && typeof data.error === "string" && data.error) ||
            `Request failed (${response.status}). Try again.`
        );
        return;
      }

      setProgress(1);
      const mapped = mapApiToResult(data as ApiResponse);
      setResult(mapped);
      // small visual delay to let the bar reach 100%
      setTimeout(() => setPhase("result"), 120);
    } catch (err) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setProgress(0);
      setPhase("idle");
      setApiError("Could not reach the checker. Check your connection and try again.");
    }
  };

  const onTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canAnalyze) runAnalyze();
    }
  };

  const loadSample = () => {
    setMode("message");
    setText(SAMPLE_TEXT.marketplace);
    setApiError("");
    setFileError("");
  };

  return (
    <div
      id={id}
      className="card-elevated"
      style={{ width: "100%", padding: 0, overflow: "hidden", position: "relative" }}
    >
      {/* Header strip */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--hairline)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--brand-600)", display: "inline-flex" }}>
            <Icon name="radar" size={18} strokeWidth={1.75} />
          </span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Scam check</span>
          <span
            className="pill pill-soft"
            style={{ padding: "2px 8px", fontSize: 11 }}
          >
            <span className="pill-dot" style={{ width: 5, height: 5 }} />
            Free
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {phase === "result" && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
              <Icon name="refresh" size={14} strokeWidth={2} />
              New check
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {phase !== "result" ? (
        <div style={{ padding: 24 }}>
          {apiError ? (
            <div
              role="alert"
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                background: "var(--risk-high-bg)",
                border: "1px solid var(--risk-high-line)",
                color: "var(--risk-high-ink)",
                borderRadius: "var(--r-md)",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon name="alert" size={14} strokeWidth={2.4} />
                {apiError}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setApiError("");
                  if (canAnalyze) runAnalyze();
                }}
              >
                Try again
              </button>
            </div>
          ) : null}

          <ModeTabs value={mode} onChange={setMode} />

          {mode !== "screenshot" ? (
            <div style={{ position: "relative" }}>
              <textarea
                ref={textAreaRef}
                className="field"
                rows={5}
                placeholder={
                  mode === "link"
                    ? "Paste a suspicious URL — e.g. fb-marketp1ace-delivery.co/confirm"
                    : "Paste the message you received. Tip: Cmd+V also pastes screenshots."
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onTextKeyDown}
                onPaste={onPaste}
                style={{ minHeight: 132, fontSize: 15, paddingRight: 88 }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--ink-4)",
                }}
              >
                <kbd
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "var(--surface-3)",
                    border: "1px solid var(--hairline)",
                    color: "var(--ink-3)",
                  }}
                >
                  ⌘+Enter
                </kbd>
              </div>
            </div>
          ) : (
            <>
              <DropZone
                fileName={file?.name || null}
                dragging={dragging}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                inputRef={fileInputRef}
                onFileChange={onFileInputChange}
              />
              {fileError ? (
                <div style={{ marginTop: 10, fontSize: 13, color: "var(--risk-high-ink)" }}>
                  {fileError}
                </div>
              ) : null}
            </>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <AnalyzeButton
              analyzing={phase === "analyzing"}
              progress={progress}
              disabled={!canAnalyze}
              onClick={() => runAnalyze()}
            />
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={loadSample}
              disabled={phase === "analyzing"}
            >
              Try sample
            </button>
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--hairline)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 12,
              color: "var(--ink-3)",
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="lock" size={12} strokeWidth={2.2} />
              Local-first, encrypted in transit
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="eye" size={12} strokeWidth={2.2} />
              We don&apos;t sell your data
            </span>
          </div>
        </div>
      ) : (
        result && <ResultView result={result} onReset={reset} />
      )}
    </div>
  );
});

export default CheckerCard;
export { SAMPLE_TEXT };
