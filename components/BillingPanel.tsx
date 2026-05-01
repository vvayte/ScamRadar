"use client";

import { useState } from "react";

type PlanId = "single" | "monthly" | "yearly";

type Plan = {
  id: PlanId;
  name: string;
  amount: number;
  cadence: string;
  description: string;
  features: string[];
  emphasis?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "single",
    name: "Single check",
    amount: 0.99,
    cadence: "one-off",
    description: "One urgent answer when you need it.",
    features: ["1 full scam check", "Full reasons & next step", "No subscription"],
  },
  {
    id: "monthly",
    name: "Shield Monthly",
    amount: 4.99,
    cadence: "/month",
    description: "Unlimited checks, billed monthly.",
    features: ["Unlimited full checks", "Forensic report unlocked", "History & watchlist"],
    emphasis: true,
  },
  {
    id: "yearly",
    name: "Shield Yearly",
    amount: 29.99,
    cadence: "/year",
    description: "Unlimited checks, billed annually.",
    features: ["Everything in Monthly", "Save vs monthly", "Priority support"],
  },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

/**
 * The displayed amount is intentionally NOT changed across currencies.
 * If $4.99 is the USD price, the EUR Stripe price ID is also priced at €4.99
 * and the GBP one at £4.99. We only swap the symbol.
 */
function formatPrice(currency: string, amount: number): string {
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  return `${symbol}${amount.toFixed(2)}`;
}

export default function BillingPanel({
  status,
  detectedCurrency,
}: {
  status: {
    premium: boolean;
    credits: number;
    count: number;
    freeLimit: number;
    subscriptionStatus: string | null;
  };
  detectedCurrency: "usd" | "eur" | "gbp";
}) {
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const purchase = async (id: PlanId) => {
    setPending(id);
    setError("");
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: id }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error || "Could not start checkout.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(null);
    }
  };

  const remainingFree = Math.max(0, status.freeLimit - status.count);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="text-xs uppercase tracking-[0.18em] text-white/55">Current plan</div>
        <div className="mt-2 text-xl font-bold text-white">
          {status.premium ? "Shield · active" : status.credits > 0 ? "Pay-as-you-go" : "Free"}
        </div>
        <div className="mt-1 text-sm text-white/60">
          {status.premium
            ? `Subscription status: ${status.subscriptionStatus || "active"}`
            : status.credits > 0
              ? `${status.credits} paid check${status.credits === 1 ? "" : "s"} remaining`
              : `${remainingFree} of ${status.freeLimit} free checks remaining on this account`}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-6 ${plan.emphasis ? "border-white/30 bg-white/[0.06]" : "border-white/10 bg-white/[0.025]"}`}
          >
            <div className="text-xs uppercase tracking-[0.18em] text-white/55">{plan.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">
                {formatPrice(detectedCurrency, plan.amount)}
              </span>
              <span className="text-sm font-semibold text-white/45">{plan.cadence}</span>
            </div>
            <p className="mt-2 text-sm text-white/60">{plan.description}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-white/75">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/55" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => purchase(plan.id)}
              disabled={pending !== null}
              className={`press mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.emphasis
                  ? "bg-white text-[#04080d] hover:bg-white/90"
                  : "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              }`}
            >
              {pending === plan.id
                ? "Redirecting…"
                : plan.id === "single"
                  ? "Buy 1 check"
                  : "Subscribe"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/45">
        Pricing is shown in your local currency where supported (USD / EUR / GBP). The numeric amount is the same across regions. Stripe handles checkout securely.
      </p>
    </div>
  );
}
