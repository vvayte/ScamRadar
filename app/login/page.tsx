"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RadarSweep } from "@/components/Icons";
import { LanguageToggle, useT } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@scamradar.app";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || t("login.failed"));
        return;
      }
      router.push("/dashboard/checker");
      router.refresh();
    } catch {
      setError(t("login.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell flex min-h-screen flex-col items-center justify-center px-5 py-10 text-white">
      <div className="absolute right-5 top-5 md:right-8 md:top-8">
        <LanguageToggle />
      </div>
      <Link href="/" className="mb-10 flex items-center gap-2.5 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-500/15">
          <RadarSweep size={22} />
        </span>
        <span className="text-base font-bold">ScamRadar</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">{t("login.title")}</h1>
        <p className="mt-1 text-sm text-white/55">{t("login.subtitle")}</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              {t("login.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                {t("login.password")}
              </label>
              <a
                href={`mailto:${supportEmail}?subject=Password%20reset%20request`}
                className="text-xs text-white/55 hover:text-white"
              >
                {t("login.forgot")}
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="press w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#04080d] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/55">
          {t("login.no_account")}{" "}
          <Link href="/signup" className="font-semibold text-white hover:underline">
            {t("login.create")}
          </Link>
        </div>
      </div>
    </div>
  );
}
