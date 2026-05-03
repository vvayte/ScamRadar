"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "scamRadarFlashOfferStart";
const DURATION_MS = 15 * 60 * 1000;

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function FlashOffer({ premium }: { premium: boolean }) {
  const [show, setShow] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_MS);
  const [pending, setPending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (premium) return;

    const existing = Number(localStorage.getItem(STORAGE_KEY) || "0");
    const now = Date.now();
    let start = existing;

    if (!existing) {
      // First visit — set timer
      start = now;
      localStorage.setItem(STORAGE_KEY, String(start));
    } else if (now - existing >= DURATION_MS) {
      // Offer expired — reset so next visit shows fresh
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const elapsed = now - start;
    const initialRemaining = DURATION_MS - elapsed;
    setRemaining(initialRemaining);

    // Show after 4-second delay so it "pops up" naturally
    const showTimer = setTimeout(() => setShow(true), 4000);

    const interval = setInterval(() => {
      const left = DURATION_MS - (Date.now() - start);
      if (left <= 0) {
        setShow(false);
        localStorage.removeItem(STORAGE_KEY);
        clearInterval(interval);
      } else {
        setRemaining(left);
      }
    }, 1000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(interval);
    };
  }, [premium]);

  const handleClaim = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "flash" }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else setPending(false);
    } catch {
      setPending(false);
    }
  };

  if (!show || dismissed) return null;

  return (
    <div className="fade-in-up fixed inset-x-4 bottom-4 z-40 w-auto max-w-none overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-br from-[#1a1206] via-[#0a1a24] to-[#04141d] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] sm:left-auto sm:w-[calc(100%-2rem)] sm:max-w-sm">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss flash offer"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/40 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="relative p-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-200">
          <span className="blink h-1.5 w-1.5 rounded-full bg-amber-300" />
          Flash deal · for new users
        </div>
        <h3 className="mt-3 text-lg font-black text-white">First month for $3.49</h3>
        <p className="mt-1 text-sm text-white/70">
          One-time intro on Shield Monthly. After this month, renews at $4.99/mo. Cancel anytime.
        </p>
        <div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
          <span className="min-w-0 text-xs uppercase tracking-wider text-white/55">Expires in</span>
          <span className="flash-timer-pulse mono-readout shrink-0 text-xl font-black text-amber-200">{format(remaining)}</span>
        </div>
        <button
          onClick={handleClaim}
          disabled={pending}
          className="mt-3 w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-[#3b2206] transition hover:bg-amber-200 disabled:opacity-70"
        >
          {pending ? "Redirecting..." : "Claim $3.49 deal →"}
        </button>
      </div>
    </div>
  );
}
