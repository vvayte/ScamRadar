"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  label: string;
  target: number;
  suffix?: string;
  prefix?: string;
};

const STATS: Stat[] = [
  { label: "Free checks included", target: 2 },
  { label: "Input types", target: 3 },
  { label: "Max image upload", target: 8, suffix: "MB" },
  { label: "Launch safeguards", target: 4 },
];

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function useCountUp(target: number, durationMs = 1600, trigger = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, trigger]);

  return value;
}

function StatTile({ stat, active }: { stat: Stat; active: boolean }) {
  const value = useCountUp(stat.target, 1600, active);
  return (
    <div className="gradient-border p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/50">{stat.label}</div>
      <div className="mono-readout mt-3 text-4xl font-black text-white md:text-5xl">
        {stat.prefix || ""}
        {formatNumber(value)}
        {stat.suffix || ""}
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-500 to-orange-400 shimmer-bg" />
      </div>
    </div>
  );
}

export default function LiveStats() {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-4">
      {STATS.map((stat) => (
        <StatTile key={stat.label} stat={stat} active={active} />
      ))}
    </div>
  );
}
