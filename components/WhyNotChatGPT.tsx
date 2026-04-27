"use client";

const ROWS = [
  {
    feature: "Instant score (0–100), comparable across checks",
    chatgpt: "Wordy paragraphs, no consistent scoring",
    scamradar: "Deterministic score every time",
    gptOk: false,
  },
  {
    feature: "Domain age, WHOIS, SSL cert history",
    chatgpt: "Cannot reach the internet for verification",
    scamradar: "Live lookups on every URL",
    gptOk: false,
  },
  {
    feature: "Reverse image search on listing photos",
    chatgpt: "No access to image indexes",
    scamradar: "Matched against multi-country listing DB",
    gptOk: false,
  },
  {
    feature: "Crypto wallet reputation",
    chatgpt: "No on-chain visibility",
    scamradar: "Known scam-cluster tags (Chainalysis-grade)",
    gptOk: false,
  },
  {
    feature: "Live community reports",
    chatgpt: "Training data is frozen; no real-time intel",
    scamradar: "Updated continuously from user reports",
    gptOk: false,
  },
  {
    feature: "Matching against 10 documented scam playbooks",
    chatgpt: "Describes generic patterns",
    scamradar: "Named match + prevalence + recovery plan",
    gptOk: false,
  },
  {
    feature: "Evidence pack (PDF + chain of custody)",
    chatgpt: "Plain text only",
    scamradar: "One-click export for disputes",
    gptOk: false,
  },
  {
    feature: "Structured follow-up investigation",
    chatgpt: "Depends on prompt skill",
    scamradar: "Case-aware follow-up Q&A",
    gptOk: false,
  },
  {
    feature: "Screenshot analysis from mobile camera",
    chatgpt: "Possible, but no OCR tuning for chat UI",
    scamradar: "Purpose-built for marketplace screenshots",
    gptOk: "partial",
  },
  {
    feature: "Refuses to help because of 'safety'",
    chatgpt: "Sometimes yes",
    scamradar: "Never — detecting scams is the whole job",
    gptOk: false,
  },
];

export default function WhyNotChatGPT() {
  return (
    <div className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-[0.22em] text-white/50">Honest comparison</div>
        <h2 className="mt-2 text-3xl font-black md:text-4xl">
          &ldquo;Why not just <span className="gradient-text">ask ChatGPT</span>?&rdquo;
        </h2>
        <p className="mt-3 soft-muted">
          Fair question. ChatGPT is great at explaining what a scam looks like in general. ScamRadar is
          built to investigate <em>this specific</em> message — with live data, structured output, and
          tools ChatGPT fundamentally does not have.
        </p>
      </div>

      {/* Desktop: 3-column table */}
      <div className="mt-6 hidden overflow-hidden rounded-3xl border border-white/10 md:block">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-black/40 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          <div className="px-5 py-4">Capability</div>
          <div className="px-5 py-4 border-l border-white/10">ChatGPT / generic LLM</div>
          <div className="relative px-5 py-4 border-l border-white/10 text-cyan-100">ScamRadar</div>
        </div>
        {ROWS.map((row, i) => (
          <div
            key={row.feature}
            className={`grid grid-cols-[1.4fr_1fr_1fr] text-sm ${i % 2 === 0 ? "bg-black/15" : "bg-black/25"}`}
          >
            <div className="px-5 py-4 text-white/85">{row.feature}</div>
            <div className="px-5 py-4 border-l border-white/10 text-white/60">
              <span className="mr-2">
                {row.gptOk === true ? "✓" : row.gptOk === "partial" ? "~" : "—"}
              </span>
              {row.chatgpt}
            </div>
            <div className="px-5 py-4 border-l border-white/10 bg-cyan-500/[0.05] text-white/90">
              <span className="mr-2 text-emerald-300">✓</span>
              {row.scamradar}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: stacked rows */}
      <div className="mt-6 space-y-3 md:hidden">
        {ROWS.map((row) => (
          <div key={row.feature} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="border-b border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white">
              {row.feature}
            </div>
            <div className="grid grid-cols-1 divide-y divide-white/10">
              <div className="px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">ChatGPT / LLM</div>
                <div className="mt-1 flex items-start gap-2 text-sm text-white/70">
                  <span className="shrink-0">
                    {row.gptOk === true ? "✓" : row.gptOk === "partial" ? "~" : "—"}
                  </span>
                  <span>{row.chatgpt}</span>
                </div>
              </div>
              <div className="bg-cyan-500/[0.06] px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">ScamRadar</div>
                <div className="mt-1 flex items-start gap-2 text-sm text-white/90">
                  <span className="shrink-0 text-emerald-300">✓</span>
                  <span>{row.scamradar}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="text-sm font-bold text-white">🎯 Built for one job</div>
          <div className="mt-1 text-xs leading-5 text-white/65">Every signal, prompt, and UI element is tuned for catching scams. No distractions.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="text-sm font-bold text-white">⚡ 1.8s average</div>
          <div className="mt-1 text-xs leading-5 text-white/65">No login, no prompt-engineering, no hoping the model feels helpful today.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="text-sm font-bold text-white">📁 Evidence-ready output</div>
          <div className="mt-1 text-xs leading-5 text-white/65">Reports you can forward to your bank, the marketplace, or law enforcement.</div>
        </div>
      </div>
    </div>
  );
}
