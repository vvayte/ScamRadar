import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import LandingDemoCard from "@/components/LandingDemoCard";

export default function HomePage() {
  return (
    <div className="site-shell flex min-h-screen flex-col text-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-5 py-20 text-center md:px-8 md:py-28">
          <div className="fade-in-up mx-auto inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
            AI-assisted scam screening
          </div>
          <h1
            className="fade-in-up mx-auto mt-6 max-w-3xl font-serif-display text-4xl font-black leading-[1.05] tracking-tight md:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Check suspicious messages
            <span className="block text-white/55">before you click or pay.</span>
          </h1>
          <p
            className="fade-in-up mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 md:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            Paste a message, link, or screenshot. ScamRadar highlights warning signs and gives you a clear next step.
          </p>

          <div
            className="fade-in-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/signup"
              className="press w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#04080d] transition hover:bg-white/90 sm:w-auto"
            >
              Sign up free
            </Link>
            <Link
              href="/login"
              className="press w-full rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] sm:w-auto"
            >
              Log in
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">
            Includes limited free checks. AI-assisted analysis, not a guarantee.
          </p>

          <LandingDemoCard />
        </section>

        {/* What you get */}
        <section className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">What you get</div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">A second opinion in seconds</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Message, link & screenshot checks",
                body: "Paste text, drop a URL, or upload a screenshot. ScamRadar reads them all.",
              },
              {
                title: "Plain-English risk explanations",
                body: "No jargon. Just what looks off, and why it matters for your next step.",
              },
              {
                title: "History & watchlist in your dashboard",
                body: "Your past checks and flagged senders, kept in your account.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="hover-lift rounded-2xl border border-white/8 bg-white/[0.025] p-6"
              >
                <div className="text-sm font-semibold text-white">{card.title}</div>
                <p className="mt-2 text-sm leading-6 text-white/60">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">How it works</div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Three steps to your next deal</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { n: 1, t: "Create an account", d: "Free to start. Email and password — that’s it." },
              { n: 2, t: "Paste a message, link, or screenshot", d: "Inside your dashboard, the checker takes any of the three." },
              { n: 3, t: "Get risk signals and safer next steps", d: "Plain-English breakdown plus what to do next." },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <div className="mono-readout flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-xs font-bold text-white/70">
                  {step.n}
                </div>
                <div className="mt-3 text-sm font-semibold text-white">{step.t}</div>
                <p className="mt-2 text-sm leading-6 text-white/60">{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing preview */}
        <section className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Pricing</div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Start free. Upgrade when you need more.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Free</div>
              <div className="mt-3 text-3xl font-black">2 checks</div>
              <p className="mt-2 text-sm leading-6 text-white/60">Limited free checks to try the product. No card needed.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-white/65">Shield Monthly</div>
              <div className="mt-3 text-3xl font-black">$4.99<span className="text-base font-semibold text-white/45">/mo</span></div>
              <p className="mt-2 text-sm leading-6 text-white/65">Unlimited checks, full forensic breakdown, history & watchlist.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Shield Yearly</div>
              <div className="mt-3 text-3xl font-black">$29.99<span className="text-base font-semibold text-white/45">/yr</span></div>
              <p className="mt-2 text-sm leading-6 text-white/60">Same as monthly, billed once a year.</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-white/75 underline-offset-4 hover:text-white hover:underline"
            >
              See full pricing →
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-3xl px-5 py-16 text-center md:px-8 md:py-24">
          <h2 className="font-serif-display text-3xl font-black md:text-4xl">
            Ready to check suspicious messages safely?
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="press w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#04080d] transition hover:bg-white/90 sm:w-auto"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="press w-full rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] sm:w-auto"
            >
              Log in
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
