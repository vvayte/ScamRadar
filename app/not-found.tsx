import Link from "next/link";
import { RadarSweep } from "@/components/Icons";

export default function NotFound() {
  return (
    <main className="site-shell flex min-h-screen items-center justify-center px-4 py-16 text-white">
      <div className="glass-panel mx-auto flex w-full max-w-lg flex-col items-center gap-5 rounded-3xl px-6 py-10 text-center md:px-10 md:py-14">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-500/15 shadow-[0_0_32px_rgba(34,211,238,0.35)]"
          aria-hidden="true"
        >
          <RadarSweep size={40} />
        </div>
        <div className="text-xs uppercase tracking-[0.22em] text-white/50">Error 404</div>
        <h1 className="font-serif-display text-4xl font-black leading-tight md:text-5xl">
          Signal lost.
        </h1>
        <p className="max-w-sm text-base text-white/65">
          This page wandered off the radar. Let&apos;s get you back to safer ground.
        </p>
        <Link
          href="/"
          className="primary-cta press mt-2 inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-black text-white"
        >
          Back to ScamRadar
        </Link>
      </div>
    </main>
  );
}
