/**
 * Static demo card shown on the public landing page. Pure illustration —
 * no API call, no fake "live data" labels. Mirrors what a real result looks
 * like so visitors understand the product before they sign up.
 */
export default function LandingDemoCard() {
  return (
    <div className="mx-auto mt-12 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a121a]">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 mono-readout text-xs text-white/45">scamradar — sample</span>
      </div>

      <div className="p-5 md:p-6">
        <div className="rounded-xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/75">
          “DHL: your package is held at customs. Pay the £2.99 release fee within 24h:
          <span className="text-amber-200"> dhl-pay-uk-secure.co/release</span>”
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex items-center gap-3">
            <div className="mono-readout text-3xl font-black text-rose-300">82%</div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Risk</div>
              <div className="text-base font-bold text-white">High</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
              Look-alike domain — not the real DHL host
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
              Time pressure (“within 24h”) is a manipulation tactic
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
              Asks you to pay via an unfamiliar URL
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white/80">
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">Next step · </span>
          Don’t pay. Open dhl.com directly and check the tracking number, then delete the message.
        </div>

        <div className="mt-4 text-[11px] text-white/40">
          Illustration only. AI-assisted analysis — not a guarantee.
        </div>
      </div>
    </div>
  );
}
