"use client";

type Scenario = {
  initials: string;
  title: string;
  role: string;
  quote: string;
  signal: string;
  color: string;
};

const SCENARIOS: Scenario[] = [
  {
    initials: "MP",
    title: "Marketplace payment redirect",
    role: "Buyer or seller DM",
    quote:
      "The message pushes payment off-platform, adds urgency, and asks the user to trust a story instead of the marketplace checkout.",
    signal: "Off-platform payment",
    color: "from-cyan-500/30 to-cyan-900/10",
  },
  {
    initials: "CR",
    title: "Fake courier fee",
    role: "Local pickup listing",
    quote:
      "A small delivery fee can be used to get card details or move the victim to a fake escrow page.",
    signal: "Courier prepayment",
    color: "from-orange-500/30 to-cyan-900/10",
  },
  {
    initials: "JO",
    title: "Job onboarding deposit",
    role: "Remote work offer",
    quote:
      "The offer sounds professional, then asks for crypto, gift cards, or a refundable equipment deposit.",
    signal: "Deposit request",
    color: "from-amber-500/30 to-cyan-900/10",
  },
  {
    initials: "GC",
    title: "Gift-card support chat",
    role: "Gaming or account support",
    quote:
      "The conversation pressures the user to buy codes quickly and keep the request secret.",
    signal: "Gift-card demand",
    color: "from-cyan-500/30 to-orange-500/10",
  },
  {
    initials: "RC",
    title: "Forged receipt screenshot",
    role: "Small business order",
    quote:
      "A convincing receipt can hide mismatched domains, fake references, and missing settlement details.",
    signal: "Receipt mismatch",
    color: "from-cyan-500/30 to-rose-900/10",
  },
  {
    initials: "RD",
    title: "Rental deposit rush",
    role: "Apartment inquiry",
    quote:
      "The listing asks for a deposit before a viewing and leans on scarcity to stop the user from checking.",
    signal: "Urgent deposit",
    color: "from-cyan-500/20 to-amber-500/10",
  },
];

export default function Testimonials() {
  return (
    <div className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/50">Common scenarios</div>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Scam patterns worth checking before you pay
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/65">
          Built from public scam patterns
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((item, index) => (
          <div
            key={item.title}
            style={{ animationDelay: `${index * 80}ms` }}
            className={`fade-in-up hover-lift relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.color} p-6 md:backdrop-blur`}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 font-black text-white">
                  {item.initials}
                </div>
                <div>
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="text-xs text-white/60">{item.role}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/85">{item.quote}</p>
              <div className="mono-readout mt-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                {item.signal}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
