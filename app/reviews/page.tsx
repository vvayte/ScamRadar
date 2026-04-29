import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scam Review Board | ScamRadar",
  description:
    "Review common marketplace, rental, job, payment, and support scam scenarios before you pay or click.",
};

type ReviewScenario = {
  initials: string;
  title: string;
  context: string;
  description: string;
  signal: string;
  score: number;
  gradient: string;
};

const SCENARIOS: ReviewScenario[] = [
  {
    initials: "MP",
    title: "Marketplace payment redirect",
    context: "Buyer or seller DM",
    description:
      "The message asks to leave the marketplace, pay by instant transfer, and trust a shipping story that cannot be verified on-platform.",
    signal: "Off-platform payment",
    score: 94,
    gradient: "from-cyan-500/25 via-black/20 to-emerald-500/10",
  },
  {
    initials: "CR",
    title: "Courier fee prepayment",
    context: "Local pickup listing",
    description:
      "A small delivery or insurance fee is used to send the victim to a fake escrow page or collect payment details.",
    signal: "Courier prepayment",
    score: 91,
    gradient: "from-amber-400/25 via-black/20 to-cyan-500/10",
  },
  {
    initials: "RC",
    title: "Forged receipt screenshot",
    context: "Small business order",
    description:
      "The receipt looks convincing, but the domain, transaction reference, and settlement details do not line up.",
    signal: "Receipt mismatch",
    score: 88,
    gradient: "from-emerald-400/20 via-black/20 to-cyan-500/10",
  },
  {
    initials: "GC",
    title: "Gift-card support chat",
    context: "Gaming or account support",
    description:
      "The chat pressures the user to buy codes quickly, keep the request secret, and ignore normal support channels.",
    signal: "Gift-card demand",
    score: 96,
    gradient: "from-rose-400/20 via-black/20 to-cyan-500/10",
  },
  {
    initials: "RD",
    title: "Rental deposit rush",
    context: "Apartment inquiry",
    description:
      "The listing asks for a deposit before a viewing and leans on urgency to stop the user from checking identity or ownership.",
    signal: "Urgent deposit",
    score: 93,
    gradient: "from-cyan-500/20 via-black/20 to-amber-400/10",
  },
  {
    initials: "JO",
    title: "Job onboarding deposit",
    context: "Remote work offer",
    description:
      "The offer sounds professional, then asks for crypto, gift cards, or a refundable equipment deposit before real onboarding.",
    signal: "Deposit request",
    score: 89,
    gradient: "from-indigo-400/20 via-black/20 to-cyan-500/10",
  },
];

export default function ReviewsPage() {
  return (
    <main className="site-shell min-h-screen text-white">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100">
              Scam review board
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Review common scam patterns before you pay
            </h1>
            <p className="mt-4 text-lg leading-8 text-white/72">
              These are sample scenarios based on common public scam patterns. Paste your own message or screenshot to get
              a case-specific score and next step.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            Back to checker
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["2", "Free checks included"],
            ["3", "Input types"],
            ["8MB", "Max image upload"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mono-readout text-4xl font-black text-white">{value}</div>
              <div className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((item, index) => (
            <article
              key={item.title}
              style={{ animationDelay: `${index * 70}ms` }}
              className={`fade-in-up hover-lift relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.gradient} p-6`}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-black">
                    {item.initials}
                  </div>
                  <div>
                    <div className="font-bold">{item.title}</div>
                    <div className="text-xs text-white/55">{item.context}</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">Example risk score</span>
                  <span className="mono-readout text-2xl font-black text-cyan-100">{item.score}</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/85">{item.description}</p>
                <div className="mono-readout mt-5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  {item.signal}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[32px] border border-cyan-300/30 bg-gradient-to-br from-cyan-500/20 via-black/35 to-black p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Try it on your message</div>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">One paste can change the decision.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                ScamRadar is built for the moment before you send money, ship an item, or click a suspicious link.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/#checker"
                className="rounded-2xl bg-cyan-500 px-6 py-4 text-base font-black text-white transition hover:bg-cyan-400"
              >
                Run a free check
              </Link>
              <Link
                href="/examples"
                className="rounded-2xl border border-white/15 bg-white/[0.05] px-6 py-4 text-base font-semibold text-white transition hover:bg-white/[0.12]"
              >
                Browse scam examples
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
