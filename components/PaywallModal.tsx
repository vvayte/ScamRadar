"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BoltIcon, CheckIcon, CloseIcon, ShieldIcon } from "./Icons";

type PlanType = "single" | "monthly" | "yearly";

interface PaywallModalProps {
  show: boolean;
  onClose?: () => void;
}

export default function PaywallModal({ show, onClose }: PaywallModalProps) {
  const [pending, setPending] = useState<null | PlanType>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prev;
    };
  }, [show, onClose]);

  if (!show) return null;

  const handlePurchase = async (type: PlanType) => {
    setPending(type);
    setError("");
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error || "Could not start checkout. Please try again.");
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fade-in-up fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-cyan-400/30 bg-[#061018] shadow-[0_24px_90px_rgba(0,0,0,0.62)]">
        <div className="absolute left-1/2 top-0 h-24 w-[76%] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close paywall"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <CloseIcon size={16} />
        </button>

        <div className="relative border-b border-white/10 bg-gradient-to-r from-cyan-500/20 via-cyan-500/8 to-transparent p-6 md:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 text-sm font-semibold text-cyan-100">
            <span className="pulse-danger h-2 w-2 rounded-full bg-cyan-400" />
            Unlock full protection
          </div>

          <h2 id="paywall-title" className="max-w-xl text-3xl font-black leading-tight text-white md:text-4xl">
            You have used your free checks. Keep going with Shield.
          </h2>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Continue with unlimited checks, full forensic breakdown, and case-aware follow-up. Promo codes can be
            entered securely during Stripe checkout.
          </p>

          <div className="mt-5 max-w-xl rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
            Payments are handled by Stripe. Your unlock is saved server-side, so it can survive refreshes and new tabs.
          </div>
        </div>

        <div className="relative grid gap-4 p-6 md:grid-cols-3 md:p-8">
          <button
            type="button"
            onClick={() => handlePurchase("single")}
            disabled={pending !== null}
            className="hover-lift rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/35 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">One-off</div>
            <div className="mt-4 text-4xl font-black text-cyan-100">$0.99</div>
            <div className="mt-2 text-sm text-white/70">One urgent answer, no commitment.</div>
            <div className="mt-5 rounded-2xl bg-cyan-500/85 px-4 py-3 text-center font-bold text-white">
              {pending === "single" ? "Redirecting..." : "Unlock 1 Check"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePurchase("monthly")}
            disabled={pending !== null}
            className="hover-lift relative rounded-3xl border border-cyan-300/45 bg-cyan-500/12 p-5 text-left transition hover:border-cyan-200/60 hover:bg-cyan-500/18 disabled:cursor-not-allowed disabled:opacity-70 glow-accent"
          >
            <div className="absolute right-4 top-4 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-[#062a36]">
              Recommended
            </div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Monthly</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$4.99</span>
              <span className="text-sm font-semibold text-white/55">/mo</span>
            </div>
            <div className="mt-2 text-sm text-white/80">Unlimited checks. Promo codes accepted at checkout.</div>
            <div className="mt-5 rounded-2xl bg-cyan-100 px-4 py-3 text-center font-bold text-[#062a36]">
              {pending === "monthly" ? "Redirecting..." : "Subscribe monthly"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePurchase("yearly")}
            disabled={pending !== null}
            className="hover-lift relative rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/35 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className="absolute right-4 top-4 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-[#3b2206]">
              50% OFF
            </div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">Yearly</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-cyan-100">$29.99</span>
              <span className="text-sm font-semibold text-white/55">/yr</span>
            </div>
            <div className="mt-2 text-sm text-white/70">
              <span className="line-through text-white/40">$59.88</span> save half. Promo codes accepted.
            </div>
            <div className="mt-5 rounded-2xl bg-cyan-500/85 px-4 py-3 text-center font-bold text-white">
              {pending === "yearly" ? "Redirecting..." : "Subscribe yearly"}
            </div>
          </button>
        </div>

        <div className="relative grid gap-3 border-t border-white/10 px-6 py-5 text-sm md:grid-cols-3 md:px-8">
          <div className="flex items-center gap-2 text-white/70">
            <ShieldIcon size={16} className="text-emerald-400" /> Stripe-secured payments
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <CheckIcon size={16} className="text-emerald-400" /> Cancel anytime
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <BoltIcon size={16} className="text-emerald-400" /> Instant unlock
          </div>
        </div>

        {error ? (
          <div className="mx-6 mb-2 rounded-2xl border border-cyan-300/35 bg-cyan-500/15 px-4 py-3 text-sm text-cyan-100 md:mx-8">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 text-sm text-white/60 md:flex-row md:items-center md:justify-between md:px-8">
          <div>Protect yourself before you send money.</div>
          <div className="flex gap-4">
            <Link href="/pricing" className="text-white/80 hover:text-white">
              View full pricing
            </Link>
            <button type="button" onClick={onClose} className="text-white/55 hover:text-white">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
