import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scam Examples Library | ScamRadar",
  description: "Browse real-world marketplace scam patterns: courier-fee scams, fake escrow, romance schemes, and more. Learn the tells.",
};

type Example = {
  category: string;
  tag: string;
  risk: "High" | "Medium" | "Low";
  text: string;
  why: string[];
};

const EXAMPLES: Example[] = [
  {
    category: "Facebook Marketplace",
    tag: "Courier fee scam",
    risk: "High",
    text: "Hi! I'd love to buy your iPhone 14 Pro. I'm out of town so I'll send a courier to pick it up tomorrow. Please pay the $45 shipping fee via this secure link and I'll reimburse you plus send payment instantly.",
    why: [
      "Buyer pays nothing upfront but asks you to pay courier fees.",
      "Uses urgency ('tomorrow') to pressure a decision.",
      "Promises reimbursement that never arrives.",
    ],
  },
  {
    category: "eBay / off-platform",
    tag: "Payment diversion",
    risk: "High",
    text: "eBay fees are killing me — if you pay by Zelle or wire transfer we can skip the platform and I'll give you $200 off. Text me at +44 7700 900123.",
    why: [
      "Tries to move payment off the protected platform.",
      "Zelle and wire transfers are non-reversible.",
      "Discount bait is classic social engineering.",
    ],
  },
  {
    category: "Job offer",
    tag: "Activation deposit",
    risk: "High",
    text: "Congratulations! You've been selected for our part-time data-entry role, $680/week. To receive your onboarding kit, please send 0.005 BTC as a refundable activation deposit.",
    why: [
      "Legitimate employers never ask for deposits.",
      "Crypto payment is untraceable and non-refundable.",
      "Vague 'onboarding kit' language hides the scam.",
    ],
  },
  {
    category: "Romance / investment",
    tag: "Pig-butchering",
    risk: "High",
    text: "Hello dear, I saw your profile and you look kind. My uncle works at a Dubai firm doing USDT arbitrage, guaranteed 3% daily. Send me $500 to start, I'll show you.",
    why: [
      "Guaranteed daily returns don't exist in legitimate investing.",
      "Emotional lure followed by financial ask.",
      "Small first deposit to build trust before a larger one.",
    ],
  },
  {
    category: "Bank phishing SMS",
    tag: "Credential theft",
    risk: "High",
    text: "CHASE ALERT: Unusual $1,249 charge detected on your account. If this wasn't you, verify identity now: https://chase-secure-verify.info/login — failure to act will lock your card within 15 min.",
    why: [
      "Lookalike domain (chase-secure-verify.info).",
      "Artificial time pressure ('15 min').",
      "Banks never link directly to login pages via SMS.",
    ],
  },
  {
    category: "Rental / Airbnb",
    tag: "Fake listing deposit",
    risk: "High",
    text: "Hi, the apartment is still available. I'm currently abroad but my agent can show you. Please send a €500 security deposit via Western Union to confirm the viewing slot.",
    why: [
      "Deposit requested before any viewing.",
      "Western Union payments cannot be recovered.",
      "'Owner abroad' is a consistent excuse pattern.",
    ],
  },
  {
    category: "Avito / OLX",
    tag: "Fake escrow",
    risk: "High",
    text: "Я создал безопасную сделку на Avito-доставка — оплатите по ссылке: avito-dostavka-oplata.ru/pay?order=8812",
    why: [
      "Domain mimics the real Avito brand but isn't on avito.ru.",
      "Real marketplace escrow happens inside the official app.",
      "Redirect harvests card data, not a real payment gateway.",
    ],
  },
  {
    category: "OLX / legitimate",
    tag: "Low risk baseline",
    risk: "Low",
    text: "Hi, is the bike still available? Can I come see it tomorrow after 5pm? Also, does it include the original seat?",
    why: [
      "No payment or personal-data asks.",
      "Proposes in-person viewing, not couriers.",
      "Asks product-specific questions a scammer usually skips.",
    ],
  },
];

const riskColors = {
  High: "border-rose-400/40 bg-rose-500/15 text-rose-100",
  Medium: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  Low: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
};

export default function ExamplesPage() {
  return (
    <main className="site-shell min-h-screen text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100">
              Scam pattern library
            </div>
            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              Learn the <span className="gradient-text">tells</span>
            </h1>
            <p className="mt-4 max-w-3xl text-lg soft-muted">
              A living library of real-world scam patterns. Each card breaks down the message and the
              specific signals ScamRadar flags. Read, remember, and never fall for the same trick twice.
            </p>
          </div>
          <Link href="/" className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]">
            Back to checker
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {EXAMPLES.map((example, i) => (
            <article
              key={example.category + i}
              style={{ animationDelay: `${i * 60}ms` }}
              className="fade-in-up hover-lift rounded-3xl border border-white/10 bg-black/30 p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  {example.category}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${riskColors[example.risk]}`}>
                  {example.risk}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold">{example.tag}</h2>
              <blockquote className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm italic text-white/80">
                &ldquo;{example.text}&rdquo;
              </blockquote>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Why it&apos;s a scam</div>
                <ul className="mt-3 space-y-2">
                  {example.why.map((reason) => (
                    <li key={reason} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[32px] border border-cyan-300/30 bg-gradient-to-br from-cyan-500/20 to-black p-8 text-center md:p-12">
          <h2 className="text-3xl font-black md:text-4xl">Seen a new pattern?</h2>
          <p className="mt-3 mx-auto max-w-2xl text-lg text-white/75">
            Report suspicious listings so we can update the library and protect the next person.
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-6 py-4 text-base font-black text-white transition hover:bg-cyan-400 glow-red">
            Run a free check
          </Link>
        </div>
      </div>
    </main>
  );
}
