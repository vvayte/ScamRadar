"use client";

import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import LandingDemoCard from "@/components/LandingDemoCard";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useT();
  return (
    <div className="site-shell flex min-h-screen flex-col text-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-5 py-20 text-center md:px-8 md:py-28">
          <div className="fade-in-up mx-auto inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
            {t("hero.badge")}
          </div>
          <h1
            className="fade-in-up mx-auto mt-6 max-w-3xl font-serif-display text-4xl font-black leading-[1.05] tracking-tight md:text-6xl min-h-[6.4rem] md:min-h-[8.8rem]"
            style={{ animationDelay: "60ms" }}
          >
            {t("hero.title.1")}
            <span className="block text-white/55">{t("hero.title.2")}</span>
          </h1>
          <p
            className="fade-in-up mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 md:text-lg min-h-[3.5rem] md:min-h-[3.75rem]"
            style={{ animationDelay: "120ms" }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="fade-in-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/signup"
              className="press w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#04080d] transition hover:bg-white/90 sm:w-auto sm:min-w-[200px] text-center"
            >
              {t("hero.cta.signup")}
            </Link>
            <Link
              href="/login"
              className="press w-full rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] sm:w-auto sm:min-w-[140px] text-center"
            >
              {t("hero.cta.login")}
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">{t("hero.note")}</p>

          <LandingDemoCard />
        </section>

        {/* What you get */}
        <section className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("what.kicker")}</div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t("what.title")}</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { tt: t("what.1.t"), bb: t("what.1.b") },
              { tt: t("what.2.t"), bb: t("what.2.b") },
              { tt: t("what.3.t"), bb: t("what.3.b") },
            ].map((card) => (
              <div
                key={card.tt}
                className="hover-lift flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-6 min-h-[10rem]"
              >
                <div className="text-sm font-semibold text-white min-h-[2.5rem]">{card.tt}</div>
                <p className="mt-2 text-sm leading-6 text-white/60">{card.bb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("how.kicker")}</div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t("how.title")}</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { n: 1, tt: t("how.1.t"), dd: t("how.1.b") },
              { n: 2, tt: t("how.2.t"), dd: t("how.2.b") },
              { n: 3, tt: t("how.3.t"), dd: t("how.3.b") },
            ].map((step) => (
              <div key={step.n} className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-6 min-h-[12rem]">
                <div className="mono-readout flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-xs font-bold text-white/70">
                  {step.n}
                </div>
                <div className="mt-3 text-sm font-semibold text-white min-h-[2.5rem]">{step.tt}</div>
                <p className="mt-2 text-sm leading-6 text-white/60">{step.dd}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing preview */}
        <section className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("pricing.kicker")}</div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t("pricing.title")}</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-6 min-h-[11rem]">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("pricing.free.k")}</div>
              <div className="mt-3 text-3xl font-black">{t("pricing.free.v")}</div>
              <p className="mt-2 text-sm leading-6 text-white/60">{t("pricing.free.b")}</p>
            </div>
            <div className="flex flex-col rounded-2xl border border-white/15 bg-white/[0.04] p-6 min-h-[11rem]">
              <div className="text-xs uppercase tracking-[0.22em] text-white/65">{t("pricing.monthly.k")}</div>
              <div className="mt-3 text-3xl font-black">$4.99<span className="text-base font-semibold text-white/45">{t("pricing.per.mo")}</span></div>
              <p className="mt-2 text-sm leading-6 text-white/65">{t("pricing.monthly.b")}</p>
            </div>
            <div className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-6 min-h-[11rem]">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t("pricing.yearly.k")}</div>
              <div className="mt-3 text-3xl font-black">$29.99<span className="text-base font-semibold text-white/45">{t("pricing.per.yr")}</span></div>
              <p className="mt-2 text-sm leading-6 text-white/60">{t("pricing.yearly.b")}</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-white/75 underline-offset-4 hover:text-white hover:underline"
            >
              {t("pricing.see")}
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-3xl px-5 py-16 text-center md:px-8 md:py-24">
          <h2 className="font-serif-display text-3xl font-black md:text-4xl">
            {t("final.title")}
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="press w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#04080d] transition hover:bg-white/90 sm:w-auto"
            >
              {t("final.create")}
            </Link>
            <Link
              href="/login"
              className="press w-full rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] sm:w-auto"
            >
              {t("hero.cta.login")}
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
