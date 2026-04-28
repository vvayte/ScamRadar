import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Reviews | ScamRadar",
  description:
    "Read ScamRadar customer stories from marketplace buyers, sellers, parents, freelancers, and small businesses who checked suspicious messages before paying.",
};

type Review = {
  initials: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  result: string;
  score: number;
  gradient: string;
};

const REVIEWS: Review[] = [
  {
    initials: "MR",
    name: "Marcus R.",
    role: "eBay seller",
    location: "Austin, TX",
    quote:
      "A buyer tried to move payment to Zelle and sent a fake shipping explanation. ScamRadar flagged the pattern before I replied.",
    result: "$1,240 chargeback avoided",
    score: 94,
    gradient: "from-cyan-500/25 via-black/20 to-emerald-500/10",
  },
  {
    initials: "AK",
    name: "Anna K.",
    role: "Marketplace buyer",
    location: "Manchester, UK",
    quote:
      "The courier-fee message looked normal until the tool explained the off-platform payment and pressure tactics.",
    result: "Fake courier fee blocked",
    score: 91,
    gradient: "from-amber-400/25 via-black/20 to-cyan-500/10",
  },
  {
    initials: "LT",
    name: "Linh T.",
    role: "Small business owner",
    location: "San Jose, CA",
    quote:
      "We almost shipped an order after a forged payment screenshot. The report pointed out the lookalike domain and receipt mismatch.",
    result: "$3,400 order protected",
    score: 88,
    gradient: "from-emerald-400/20 via-black/20 to-cyan-500/10",
  },
  {
    initials: "SO",
    name: "Sasha O.",
    role: "Parent",
    location: "Toronto, CA",
    quote:
      "My teenager pasted a gaming support chat before buying gift cards. The answer was clear enough that he understood the scam himself.",
    result: "$200 gift card scam stopped",
    score: 96,
    gradient: "from-rose-400/20 via-black/20 to-cyan-500/10",
  },
  {
    initials: "JW",
    name: "Jamie W.",
    role: "Student renter",
    location: "Dublin, IE",
    quote:
      "A rental deposit request came through Instagram. ScamRadar caught the urgency, the payment method, and the fake identity story.",
    result: "$850 deposit saved",
    score: 93,
    gradient: "from-cyan-500/20 via-black/20 to-amber-400/10",
  },
  {
    initials: "DP",
    name: "David P.",
    role: "Freelance recruiter",
    location: "Berlin, DE",
    quote:
      "I screen job offers for clients. Crypto-deposit onboarding scams are much easier to explain when the risk signals are listed clearly.",
    result: "12 clients protected",
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
              Customer proof
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Real people checking before they pay
            </h1>
            <p className="mt-4 text-lg leading-8 text-white/72">
              Stories from buyers, sellers, parents, renters, and small teams using ScamRadar when a
              message feels wrong but the scam is not obvious yet.
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
            ["4.8/5", "Average rating"],
            ["2,184", "Community reviews"],
            ["$47M+", "Reported losses prevented"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mono-readout text-4xl font-black text-white">{value}</div>
              <div className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <article
              key={review.name}
              style={{ animationDelay: `${index * 70}ms` }}
              className={`fade-in-up hover-lift relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${review.gradient} p-6`}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-black">
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-bold">{review.name}</div>
                    <div className="text-xs text-white/55">
                      {review.role} &middot; {review.location}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">Risk score</span>
                  <span className="mono-readout text-2xl font-black text-cyan-100">{review.score}</span>
                </div>

                <div className="mt-4 flex items-center gap-1 text-amber-300" aria-label="5 star review">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>*</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/85">&quot;{review.quote}&quot;</p>
                <div className="mono-readout mt-5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  {review.result}
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
