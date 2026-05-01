"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent } from "react";
import ResultCard, { type ScamResult } from "@/components/ResultCard";
import ForensicReport from "@/components/ForensicReport";
import PaywallModal from "@/components/PaywallModal";
import type { AnalysisArtifact } from "@/lib/analysisArtifacts";
import { CameraIcon, CloseIcon, ScanIcon, UploadIcon } from "@/components/Icons";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

type CheckResponse = ScamResult & {
  artifacts?: AnalysisArtifact[];
  signalExplanations?: string[];
  usage?: {
    premium: boolean;
    credits: number;
    count: number;
    freeLimit: number;
  };
  error?: string;
  code?: string;
};

export default function CheckerPanel() {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paywall, setPaywall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Image is too large. Maximum supported size is 8MB.");
      return;
    }
    setError("");
    setImageFile(file);
  };

  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) setImageFile(file);
        break;
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (loading) return;
    if (!text.trim() && !imageFile) {
      setError("Paste a message, link, or upload a screenshot to analyze.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let res: Response;
      if (imageFile) {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("image", imageFile);
        res = await fetch("/api/check", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }
      const data = (await res.json()) as CheckResponse;
      if (res.status === 402 || data?.code === "PAYWALL_REQUIRED") {
        setPaywall(true);
        return;
      }
      if (!res.ok) {
        setError(data?.error || "Could not analyze. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Scam check</div>
            <div className="mt-1 text-base font-semibold text-white">Paste a message, link, or screenshot</div>
          </div>
          <ScanIcon size={22} className="text-white/40" />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={onPaste}
          placeholder="Paste a suspicious message, a URL, or describe what happened…"
          className="input-field mt-5 min-h-[160px] w-full resize-y rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="press inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
          >
            <UploadIcon size={14} /> Upload screenshot
          </button>
          <span className="inline-flex items-center gap-2 text-xs text-white/45">
            <CameraIcon size={14} /> or paste an image into the text box
          </span>
          {imagePreview ? (
            <span className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1 text-xs text-white/75">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview, no remote image to optimize */}
              <img src={imagePreview} alt="preview" className="h-6 w-6 rounded object-cover" />
              {imageFile?.name?.slice(0, 22) || "screenshot"}
              <button
                type="button"
                onClick={clearImage}
                className="rounded-full p-0.5 text-white/55 hover:text-white"
                aria-label="Remove image"
              >
                <CloseIcon size={12} />
              </button>
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="press primary-cta mt-5 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        <p className="mt-3 text-xs text-white/40">
          AI-assisted analysis. Not a guarantee. Verify through official channels before sending money or personal data.
        </p>
      </div>

      {result ? (
        <>
          <ResultCard result={result} />
          <ForensicReport
            input={text}
            result={result}
            artifacts={result.artifacts || []}
            signalExplanations={result.signalExplanations || []}
          />
        </>
      ) : null}

      <PaywallModal show={paywall} onClose={() => setPaywall(false)} />
    </div>
  );
}
