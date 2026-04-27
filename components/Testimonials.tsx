"use client";

type Testimonial = {
  initials: string;
  name: string;
  role: string;
  quote: string;
  saved?: string;
  color: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    initials: "MR",
    name: "Marcus R.",
    role: "eBay seller, 8 years",
    quote:
      "Pasted a buyer's message asking for Zelle off-platform. ScamRadar flagged it instantly with a 94 score. Saved me from what looked exactly like a chargeback scheme.",
    saved: "$1,240 saved",
    color: "from-cyan-500/30 to-cyan-900/10",
  },
  {
    initials: "AK",
    name: "Anna K.",
    role: "Facebook Marketplace buyer",
    quote:
      "The fake courier fee trick is rampant here. I now paste every weird buyer message before replying. It catches the obvious ones and explains why.",
    saved: "$45 saved",
    color: "from-orange-500/30 to-cyan-900/10",
  },
  {
    initials: "DP",
    name: "David P.",
    role: "Freelance recruiter",
    quote:
      "I screen job offers for my clients. ScamRadar catches crypto-deposit 'onboarding' scams better than any checklist I've built in 10 years.",
    saved: "12 clients protected",
    color: "from-amber-500/30 to-cyan-900/10",
  },
  {
    initials: "SO",
    name: "Sasha O.",
    role: "Mom, 2 teens",
    quote:
      "My son almost sent gift cards to a 'gaming support' bot. The screenshot tool let him check before buying. Now it's our house rule.",
    saved: "$200 saved",
    color: "from-cyan-500/30 to-orange-500/10",
  },
  {
    initials: "LT",
    name: "Linh T.",
    role: "Small business owner",
    quote:
      "A customer sent a 'payment confirmation' receipt that looked real. ScamRadar spotted the lookalike domain and forged metadata. We didn't ship the order.",
    saved: "$3,400 saved",
    color: "from-cyan-500/30 to-rose-900/10",
  },
  {
    initials: "JW",
    name: "Jamie W.",
    role: "College student",
    quote:
      "Got a 'rental deposit' request via Instagram DM for an apartment. One paste and I knew it was fake. No way I could have noticed the URL trick myself.",
    saved: "$850 saved",
    color: "from-cyan-500/20 to-amber-500/10",
  },
];

export default function Testimonials() {
  return (
    <div className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/50">Real stories</div>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            People using ScamRadar before they lose money
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm">
          <span className="mono-readout text-amber-300">4.8</span>
          <span className="text-white/60">/ 5 avg · 2,184 reviews</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, index) => (
          <div
            key={t.name}
            style={{ animationDelay: `${index * 80}ms` }}
            className={`fade-in-up hover-lift relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${t.color} p-6 md:backdrop-blur`}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 font-black text-white">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-xs text-white/60">{t.role}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-white/85">&ldquo;{t.quote}&rdquo;</p>
              {t.saved ? (
                <div className="mono-readout mt-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  {t.saved}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
