"use client";

import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <main className="site-shell flex min-h-screen items-center justify-center px-4 py-12 text-white">
      <div className="fade-in-up w-full max-w-xl rounded-[32px] border border-white/15 bg-black/35 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/35 bg-amber-500/20">
          <span className="text-2xl text-amber-200">!</span>
        </div>

        <h1 className="text-3xl font-black md:text-4xl">Checkout Cancelled</h1>
        <p className="mt-4 text-base leading-7 text-white/75">
          No worries. You can continue with free checks now and upgrade later whenever you need full confidence.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-7 rounded-2xl bg-cyan-500 px-6 py-3 text-base font-black text-white transition hover:bg-cyan-400"
        >
          Back to checker
        </button>
      </div>
    </main>
  );
}
