"use client";

type Example = {
  id: string;
  category: string;
  risk: "High" | "Medium" | "Low";
  preview: string;
  text: string;
};

const EXAMPLES: Example[] = [
  {
    id: "fb-delivery",
    category: "Facebook Marketplace",
    risk: "High",
    preview: "Buyer insists on courier with upfront delivery fee",
    text: "Hi! I'd love to buy your iPhone 14 Pro. I'm out of town so I'll send a courier to pick it up tomorrow. Please pay the $45 shipping fee via this secure link and I'll reimburse you plus send payment instantly. Here's the link: https://fb-marketp1ace-delivery.co/confirm",
  },
  {
    id: "job-crypto",
    category: "Remote job offer",
    risk: "High",
    preview: "Easy work-from-home role asking for crypto wallet",
    text: "Congratulations! You've been selected for our part-time data-entry role, $680/week. To receive your onboarding kit, please send 0.005 BTC to wallet bc1qxy2k... as a refundable activation deposit. Starts today — WhatsApp +1 (829) 555-0188.",
  },
  {
    id: "ebay-offplatform",
    category: "eBay off-platform",
    risk: "High",
    preview: "Seller wants to move to WhatsApp + wire transfer",
    text: "I saw your bid on the MacBook. eBay fees are killing me — if you pay by Zelle or wire transfer we can skip the platform and I'll give you $200 off. Text me at +44 7700 900123, I'll ship same day.",
  },
  {
    id: "legit-olx",
    category: "OLX / legitimate",
    risk: "Low",
    preview: "Normal buyer asking standard questions",
    text: "Hi, is the bike still available? Can I come see it tomorrow after 5pm? Also, does it include the original seat?",
  },
  {
    id: "romance",
    category: "Romance / investment",
    risk: "High",
    preview: "Instagram stranger pitching a crypto platform",
    text: "Hello dear, I saw your profile and you look kind. I want to share an opportunity — my uncle works at a Dubai firm doing USDT arbitrage, guaranteed 3% daily. Send me $500 to start, I'll show you. Trust me love.",
  },
  {
    id: "bank-phish",
    category: "Bank phishing SMS",
    risk: "High",
    preview: "Fake bank alert with urgent link",
    text: "CHASE ALERT: Unusual $1,249 charge detected on your account. If this wasn't you, verify identity now: https://chase-secure-verify.info/login — failure to act will lock your card within 15 min.",
  },
];

type Props = {
  onTry: (text: string) => void;
};

const riskColors = {
  High: "border-rose-400/40 bg-rose-500/15 text-rose-100",
  Medium: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  Low: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
};

export default function ScamExamples({ onTry }: Props) {
  return (
    <div className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/50">Try with one click</div>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Real scam examples</h2>
          <p className="mt-2 max-w-2xl text-sm soft-muted md:text-base">
            Hand-picked patterns seen across Facebook Marketplace, eBay, OLX, and DMs. Click any card to
            autofill the checker and see how ScamRadar reacts.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
          6 patterns · updated weekly
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((example, index) => (
          <button
            key={example.id}
            onClick={() => onTry(example.text)}
            style={{ animationDelay: `${index * 70}ms` }}
            className="fade-in-up hover-lift focus-ring group relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-5 text-left transition hover:border-cyan-300/30"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                {example.category}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskColors[example.risk]}`}>
                {example.risk}
              </span>
            </div>
            <div className="mt-3 text-base font-bold text-white">{example.preview}</div>
            <div className="mt-3 line-clamp-3 text-sm text-white/60">{example.text}</div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-200">
              Try this example
              <span className="transition group-hover:translate-x-0.5">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
