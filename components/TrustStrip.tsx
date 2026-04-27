"use client";

const LOGOS = [
  "Facebook Marketplace",
  "eBay",
  "OLX",
  "Avito",
  "Craigslist",
  "Mercari",
  "OfferUp",
  "Gumtree",
  "Wallapop",
  "Vinted",
];

export default function TrustStrip() {
  const track = [...LOGOS, ...LOGOS];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/60 to-transparent z-10" />
      <div className="mb-3 text-center text-[11px] uppercase tracking-[0.32em] text-white/45">
        Built to detect scams across
      </div>
      <div className="ticker-track gap-10 whitespace-nowrap px-4">
        {track.map((logo, idx) => (
          <span
            key={`${logo}-${idx}`}
            className="inline-flex items-center gap-3 text-lg font-black tracking-tight text-white/55"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400/80" />
            {logo}
          </span>
        ))}
      </div>
    </div>
  );
}
