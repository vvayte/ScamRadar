"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ScanIcon } from "@/components/Icons";

type User = {
  id: string;
  email: string;
  name: string | null;
  premium: boolean;
  credits: number;
  count: number;
  history: { id: string; createdAt: string; input: string; score: number; level: string; advice: string }[];
  watchlist: string[];
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLogoutPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="site-shell flex min-h-screen items-center justify-center text-white">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="site-shell flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div className="text-xl font-bold">You are not signed in</div>
        <Link href="/" className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-white hover:bg-cyan-400">
          Go to ScamRadar
        </Link>
      </main>
    );
  }

  return (
    <main className="site-shell min-h-screen text-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Personal account</div>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              {user.name ? `Hi, ${user.name}` : user.email}
            </h1>
            {user.name && <div className="mt-0.5 text-sm text-white/55">{user.email}</div>}
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.1]">
              ← Back
            </Link>
            <button
              onClick={handleLogout}
              disabled={logoutPending}
              className="rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:opacity-60"
            >
              {logoutPending ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>

        {/* Plan status */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Plan</div>
            <div className="mt-2 text-2xl font-black">
              {user.premium ? (
                <span className="text-cyan-300">Shield ✓</span>
              ) : (
                <span className="text-white/70">Free</span>
              )}
            </div>
            {!user.premium && (
              <Link href="/pricing" className="mt-3 inline-flex rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-400">
                Upgrade → Shield
              </Link>
            )}
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Paid credits</div>
            <div className="mono-readout mt-2 text-2xl font-black text-white">{user.credits}</div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Free checks used</div>
            <div className="mono-readout mt-2 text-2xl font-black text-white">{user.count}</div>
          </div>
        </div>

        {/* History */}
        <div className="mt-8">
          <div className="mb-4 text-xs uppercase tracking-[0.22em] text-white/45">Recent checks</div>
          {user.history.length === 0 ? (
            <div className="glass-panel flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-500/15 text-cyan-200" aria-hidden="true">
                <ScanIcon size={28} />
              </div>
              <div className="text-base font-bold text-white">Nothing checked yet</div>
              <div className="text-sm text-white/60">Run your first scan to see it here.</div>
              <Link
                href="/"
                className="press mt-1 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-400"
              >
                Run a scan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {user.history.map((item) => (
                <div key={item.id} className="glass-panel rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="mono-readout text-xs text-white/45">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.level.toLowerCase().includes("high")
                        ? "bg-rose-500/20 text-rose-200"
                        : item.level.toLowerCase().includes("medium")
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-emerald-500/20 text-emerald-200"
                    }`}>
                      {item.level} · {item.score}
                    </span>
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm text-white/80">{item.input}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist */}
        {user.watchlist.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 text-xs uppercase tracking-[0.22em] text-white/45">Watchlist</div>
            <div className="flex flex-wrap gap-2">
              {user.watchlist.map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs text-white/80 mono-readout">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
