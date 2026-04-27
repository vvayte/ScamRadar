"use client";

import { useEffect, useRef, useState } from "react";

type FeedItem = {
  id: string;
  time: string;
  level: "High" | "Medium" | "Low";
  region: string;
  indicator: string;
  type: string;
};

const SEED: FeedItem[] = [
  { id: "1", time: "just now", level: "High", region: "US-CA", indicator: "fb-marketp1ace-delivery.co", type: "Courier fee scam" },
  { id: "2", time: "12s ago", level: "High", region: "UK", indicator: "chase-secure-verify.info", type: "Bank phishing" },
  { id: "3", time: "28s ago", level: "Medium", region: "DE", indicator: "+49 15• ••• 0187", type: "Off-platform DM" },
  { id: "4", time: "44s ago", level: "High", region: "RU", indicator: "avito-dostavka-oplata.ru", type: "Fake escrow" },
  { id: "5", time: "1m ago", level: "High", region: "ES", indicator: "wallapop-envio-seguro.com", type: "Courier fee scam" },
  { id: "6", time: "1m ago", level: "Medium", region: "AU", indicator: "0.0043 BTC to bc1qxy…", type: "Job crypto deposit" },
  { id: "7", time: "2m ago", level: "High", region: "BR", indicator: "mercadolivre-pagar.net", type: "Platform clone" },
  { id: "8", time: "2m ago", level: "High", region: "NG", indicator: "apple-giftcard-support.help", type: "Gift card phish" },
];

const levelColors = {
  High: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  Medium: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  Low: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
};

export default function ThreatFeed() {
  const [items, setItems] = useState<FeedItem[]>(SEED);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setItems((prev) => {
        const rotated = [...prev];
        const last = rotated.pop();
        if (last) rotated.unshift({ ...last, time: "just now", id: `${last.id}-${Date.now()}` });
        return rotated;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [visible]);

  return (
    <div ref={ref} className="glass-strong rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/50">Live threat feed</div>
          <div className="mt-1 text-lg font-bold">Recent detections from community intel</div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
          <span className="blink h-2 w-2 rounded-full bg-emerald-400" />
          Live
        </div>
      </div>
      <div className="max-h-72 space-y-2 overflow-hidden">
        {items.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="fade-in-up flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${levelColors[item.level]}`}>
                  {item.level}
                </span>
                <span className="text-xs text-white/50">{item.region} · {item.time}</span>
              </div>
              <div className="mono-readout mt-1 truncate text-white/90">{item.indicator}</div>
              <div className="text-xs text-white/55">{item.type}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-white/45">
        Sample feed. Real data from community reports populates after sign-in.
      </p>
    </div>
  );
}
