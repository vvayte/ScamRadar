"use client";

import { useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useT } from "@/lib/i18n";

type PlanId = "lifetime" | "monthly" | "yearly";

export default function PricingPage() {
  const { t } = useT();
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const handleClick = async (id: PlanId) => {
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
      setError(data?.error || t("pp.error"));
    } catch {
      setError(t("pp.error"));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="site-shell flex min-h-screen flex-col text-white">
      <PublicHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("pp.kicker")}</div>
          <h1 className="mt-3 font-serif-display text-3xl font-black leading-[1.1] tracking-tight md:text-5xl">
            {t("pp.title.1")}
            <span className="block text-white/55">{t("pp.title.2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/65 md:text-base">
            {t("pp.subtitle")}
          </p>

          {error ? (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </section>

        <section className="mx-auto w-full max-w-5xl px-5 pb-20 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Monthly — most popular */}
            <div className="relative flex min-h-[28rem] flex-col rounded-2xl border border-cyan-300/40 bg-cyan-500/[0.06] p-6">
              <div className="absolute right-4 top-4 rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#062a36]">
                {t("pp.monthly.tag")}
              </div>
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-100">{t("pp.monthly.k")}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">$4.99</span>
                <span className="text-sm font-semibold text-white/55">{t("pp.per.mo")}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70 min-h-[3.5rem]">{t("pp.monthly.b")}</p>
              <ul className="mt-5 space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.unlimited")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.forensic")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.history")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.promo")}</li>
              </ul>
              <button
                type="button"
                onClick={() => handleClick("monthly")}
                disabled={pending !== null}
                className="press mt-auto w-full rounded-xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-[#062a36] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending === "monthly" ? t("pp.redirecting") : t("pp.monthly.cta")}
              </button>
            </div>

            {/* Yearly — best value */}
            <div className="relative flex min-h-[28rem] flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-6">
              <div className="absolute right-4 top-4 rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#3b2206]">
                {t("pp.yearly.tag")}
              </div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("pp.yearly.k")}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">$29.99</span>
                <span className="text-sm font-semibold text-white/55">{t("pp.per.yr")}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65 min-h-[3.5rem]">{t("pp.yearly.b")}</p>
              <ul className="mt-5 space-y-2 text-sm text-white/75">
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.unlimited")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.forensic")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.history")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.priority")}</li>
              </ul>
              <button
                type="button"
                onClick={() => handleClick("yearly")}
                disabled={pending !== null}
                className="press mt-auto w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending === "yearly" ? t("pp.redirecting") : t("pp.yearly.cta")}
              </button>
            </div>

            {/* Lifetime — pay once */}
            <div className="relative flex min-h-[28rem] flex-col rounded-2xl border border-white/12 bg-white/[0.025] p-6">
              <div className="absolute right-4 top-4 rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#053027]">
                {t("pp.lifetime.tag")}
              </div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("pp.lifetime.k")}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">$59.99</span>
                <span className="text-sm font-semibold text-white/55">{t("pp.once")}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65 min-h-[3.5rem]">{t("pp.lifetime.b")}</p>
              <ul className="mt-5 space-y-2 text-sm text-white/75">
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.lifetime")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.unlimited")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.forensic")}</li>
                <li className="flex items-start gap-2"><Dot /> {t("pp.feat.history")}</li>
              </ul>
              <button
                type="button"
                onClick={() => handleClick("lifetime")}
                disabled={pending !== null}
                className="press mt-auto w-full rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending === "lifetime" ? t("pp.redirecting") : t("pp.lifetime.cta")}
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs leading-6 text-white/45">{t("pp.note")}</p>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function Dot() {
  return <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/55" />;
}
