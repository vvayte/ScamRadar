"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RadarSweep } from "@/components/Icons";

export default function SignupPage() {
  const router = useRouter();
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
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
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
        setError(data?.error || "Could not create account.");
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
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell flex min-h-screen flex-col items-center justify-center px-5 py-10 text-white">
      <Link href="/" className="mb-10 flex items-center gap-2.5 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-500/15">
          <RadarSweep size={22} />
        </span>
        <span className="text-base font-bold">ScamRadar</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-white/55">
          Free to start. Limited free checks included.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Email
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
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="input-field mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`input-field mt-2 w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50 ${showMismatch ? "border-rose-400/40" : "border-white/12"}`}
            />
            {showMismatch ? (
              <div className="mt-2 text-xs text-rose-300">Passwords do not match.</div>
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
            {loading
              ? "Please wait…"
              : verificationPending
                ? "Verify & create account"
                : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-white/45">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-white/65 hover:text-white">Terms</Link> and{" "}
          <Link href="/privacy" className="text-white/65 hover:text-white">Privacy</Link>.
        </div>

        <div className="mt-6 text-center text-sm text-white/55">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
