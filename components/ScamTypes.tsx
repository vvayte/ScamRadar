"use client";

const TYPES = [
  {
    title: "Marketplace fraud",
    description: "Fake buyers, courier-fee scams, off-platform payment requests on eBay, Facebook, OLX, Avito.",
    tag: "Most common",
    tagColor: "border-cyan-400/40 bg-cyan-500/15 text-cyan-100",
    icon: "📦",
  },
  {
    title: "Phishing links",
    description: "Lookalike domains, punycode attacks, fake bank and delivery alerts with urgency hooks.",
    tag: "Grows 40% YoY",
    tagColor: "border-amber-400/40 bg-amber-500/15 text-amber-100",
    icon: "🎣",
  },
  {
    title: "Romance & crypto",
    description: "Instagram/Tinder pitches for 'guaranteed returns', pig-butchering, fake trading platforms.",
    tag: "High-loss",
    tagColor: "border-rose-400/40 bg-rose-500/15 text-rose-100",
    icon: "💔",
  },
  {
    title: "Job-offer scams",
    description: "Fake remote roles demanding crypto deposits, equipment fees, or personal data upfront.",
    tag: "Rising",
    tagColor: "border-orange-400/40 bg-orange-500/15 text-orange-100",
    icon: "💼",
  },
  {
    title: "Gift-card schemes",
    description: "Impersonation of support, family, or bosses asking for Steam, Apple, or Amazon gift cards.",
    tag: "Hard to reverse",
    tagColor: "border-cyan-400/40 bg-cyan-500/15 text-cyan-100",
    icon: "🎁",
  },
  {
    title: "Rental / deposit",
    description: "Fake landlords on Craigslist and Airbnb clones asking for deposits before showings.",
    tag: "Student-heavy",
    tagColor: "border-amber-400/40 bg-amber-500/15 text-amber-100",
    icon: "🏠",
  },
];

export default function ScamTypes() {
  return (
    <div className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.22em] text-white/50">What we catch</div>
        <h2 className="mt-2 text-3xl font-black md:text-4xl">Patterns ScamRadar is trained on</h2>
        <p className="mt-3 soft-muted">
          We combine rule-based signals, URL inspection, image analysis, and AI interpretation across the
          scam categories that cause the largest real-world losses.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((type, index) => (
          <div
            key={type.title}
            style={{ animationDelay: `${index * 60}ms` }}
            className="fade-in-up hover-lift rounded-3xl border border-white/10 bg-black/30 p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-3xl">{type.icon}</div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${type.tagColor}`}>
                {type.tag}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-bold">{type.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
