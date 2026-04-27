import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bot API | ScamRadar",
  description: "Integrate ScamRadar into your Telegram bot, WhatsApp workflow, or custom app. REST API for scam risk scoring.",
};

const ENDPOINT = "https://scamradar.app/api/bot/analyze";

const SAMPLE_REQUEST = `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "text": "Hi! I'll send a courier tomorrow. Please pay $45 shipping first via this link: https://fb-marketp1ace-delivery.co/confirm",
    "source": "telegram",
    "userId": "tg_user_88421"
  }'`;

const SAMPLE_RESPONSE = `{
  "score": 94,
  "level": "High",
  "reasons": [
    "Courier fee requested before any in-person meeting",
    "Lookalike domain using digit '1' instead of 'l' in 'marketplace'",
    "Off-platform payment before exchange of goods"
  ],
  "advice": "Do not pay. This is a well-documented courier-fee scam pattern. Report the listing on the platform and block the buyer.",
  "checkId": "chk_01HX4K...",
  "latencyMs": 1872
}`;

export default function BotApiPage() {
  return (
    <main className="site-shell min-h-screen overflow-x-hidden text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100">
              Developer · Bot API
            </div>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
              ScamRadar <span className="gradient-text">Bot API</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base soft-muted md:text-lg">
              Plug scam screening into any chat workflow. One POST, back a score, reasons, and advice.
              Ship safer bots in under 10 minutes.
            </p>
          </div>
          <Link href="/" className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1] md:px-5 md:py-3">
            Back to app
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["10 min", "From signup to first detection"],
            ["1.8s", "P50 latency including URL/image inspection"],
            ["REST", "Simple JSON in, JSON out"],
          ].map(([k, v]) => (
            <div key={k} className="gradient-border p-5 md:p-6">
              <div className="mono-readout text-3xl font-black text-white md:text-4xl">{k}</div>
              <div className="mt-2 text-sm text-white/70">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="glass-panel min-w-0 rounded-3xl p-5 md:p-8">
            <div className="text-xs uppercase tracking-[0.22em] text-white/50">Request</div>
            <h2 className="mt-2 break-words text-xl font-black md:text-2xl">POST /api/bot/analyze</h2>
            <pre className="mono-readout mt-5 max-w-full overflow-x-auto whitespace-pre rounded-2xl border border-white/10 bg-black/60 p-4 text-[11px] leading-6 text-emerald-200 md:text-xs">
              {SAMPLE_REQUEST}
            </pre>
            <div className="mt-4 grid gap-2 text-sm text-white/75">
              <div><span className="mono-readout text-cyan-200">text</span> — message or URL to screen</div>
              <div><span className="mono-readout text-cyan-200">source</span> — free-form channel tag (telegram, whatsapp, custom)</div>
              <div><span className="mono-readout text-cyan-200">userId</span> — stable user id for rate limiting</div>
            </div>
          </div>

          <div className="glass-panel min-w-0 rounded-3xl p-5 md:p-8">
            <div className="text-xs uppercase tracking-[0.22em] text-white/50">Response</div>
            <h2 className="mt-2 text-xl font-black md:text-2xl">200 OK</h2>
            <pre className="mono-readout mt-5 max-w-full overflow-x-auto whitespace-pre rounded-2xl border border-white/10 bg-black/60 p-4 text-[11px] leading-6 text-amber-200 md:text-xs">
              {SAMPLE_RESPONSE}
            </pre>
            <div className="mt-4 grid gap-2 text-sm text-white/75">
              <div><span className="mono-readout text-cyan-200">score</span> — integer 0–100</div>
              <div><span className="mono-readout text-cyan-200">level</span> — Low / Medium / High</div>
              <div><span className="mono-readout text-cyan-200">reasons</span> — top risk signals, ranked</div>
              <div><span className="mono-readout text-cyan-200">advice</span> — action for the end user</div>
            </div>
          </div>
        </div>

        <div className="mt-10 glass-panel rounded-[28px] p-5 md:rounded-[32px] md:p-8">
          <h2 className="text-2xl font-black md:text-3xl">Quick integrations</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Telegram bot",
                body: "Intercept messages with suspicious URLs, call the API, reply with risk and advice.",
                cta: "Telegram docs",
              },
              {
                title: "WhatsApp Business",
                body: "Hook into webhook events, screen inbound messages, and auto-warn buyers before they pay.",
                cta: "WhatsApp docs",
              },
              {
                title: "Discord / Slack",
                body: "Protect communities from scam DMs and drop phishing links into quarantine automatically.",
                cta: "Slash-command template",
              },
            ].map((item) => (
              <div key={item.title} className="hover-lift rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <h3 className="text-lg font-bold md:text-xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{item.body}</p>
                <div className="mt-4 inline-flex rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                  {item.cta}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 glass-panel rounded-[28px] p-5 md:rounded-[32px] md:p-8">
          <h2 className="text-2xl font-black md:text-3xl">Plans & limits</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Dev", price: "Free", limit: "100 calls / day", tag: "Build & test" },
              { name: "Startup", price: "$29/mo", limit: "10,000 calls / day", tag: "Live bots" },
              { name: "Scale", price: "Custom", limit: "Negotiated quota", tag: "Enterprise SLA" },
            ].map((plan, i) => (
              <div key={plan.name} className={`rounded-3xl border p-5 md:p-6 ${i === 1 ? "border-cyan-300/40 bg-gradient-to-b from-cyan-500/20 to-black/30" : "border-white/10 bg-black/30"}`}>
                <div className="text-sm uppercase tracking-wider text-white/55">{plan.tag}</div>
                <div className="mt-2 text-2xl font-black">{plan.name}</div>
                <div className="mono-readout mt-4 text-4xl font-black text-cyan-100 md:text-5xl">{plan.price}</div>
                <div className="mt-2 text-sm text-white/70">{plan.limit}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-white/60">
            API keys, webhooks, and audit logs are managed in your dashboard after signup.
          </div>
        </div>
      </div>
    </main>
  );
}
