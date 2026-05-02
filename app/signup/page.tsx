"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RadarSweep } from "@/components/Icons";
import { LanguageToggle, useT } from "@/lib/i18n";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const passwordsValid = password.length >= 8 && password === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setNotice("");

    if (!verificationPending) {
      if (password.length < 8) {
        setError(t("signup.failed"));
        return;
      }
      if (password !== confirmPassword) {
        setError(t("signup.mismatch"));
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          code: verificationPending ? verificationCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || t("signup.failed"));
        if (data?.requiresVerification) setVerificationPending(true);
        return;
      }
      if (data?.requiresVerification) {
        setVerificationPending(true);
        setNotice(
          data?.delivered
            ? "Verification code sent. Check your email."
            : data?.devCode
              ? `Dev code: ${data.devCode}`
              : "Verification code requested."
        );
        return;
      }
      router.push("/dashboard/checker");
      router.refresh();
    } catch {
      setError(t("signup.failed"));
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
        <h1 className="text-2xl font-bold">{t("signup.title")}</h1>
        <p className="mt-1 text-sm text-white/55">{t("signup.subtitle")}</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              {t("signup.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setVerificationPending(false);
                setVerificationCode("");
                setNotice("");
              }}
              placeholder="you@example.com"
              className="input-field mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              {t("signup.password")}
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              {t("signup.confirm")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input-field mt-2 w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50 ${showMismatch ? "border-rose-400/40" : "border-white/12"}`}
            />
            {showMismatch ? (
              <div className="mt-2 text-xs text-rose-300">{t("signup.mismatch")}</div>
            ) : null}
          </div>

          {verificationPending ? (
            <div>
              <label htmlFor="code" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Verification code
              </label>
              <input
                id="code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit email code"
                className="input-field mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
              />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              {notice}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || (!verificationPending && !passwordsValid)}
            className="press w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#04080d] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("signup.submitting") : t("signup.submit")}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-white/45">
          {t("signup.terms")}{" "}
          <Link href="/terms" className="text-white/65 hover:text-white">Terms</Link> {t("signup.and")}{" "}
          <Link href="/privacy" className="text-white/65 hover:text-white">Privacy</Link>.
        </div>

        <div className="mt-6 text-center text-sm text-white/55">
          {t("signup.have_account")}{" "}
          <Link href="/login" className="font-semibold text-white hover:underline">
            {t("signup.signin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
