"use client";

import { useState } from "react";

type Mode = "login" | "register";

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; name: string | null; premium: boolean; credits: number; count: number }) => void;
}

export default function AuthModal({ show, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : {
              email,
              password,
              name,
              code: verificationPending ? verificationCode : undefined,
            };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong.");
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
      onSuccess(data.user);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fade-in-up relative w-full max-w-md overflow-hidden rounded-[28px] border border-cyan-400/25 bg-[#061018] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="absolute left-1/2 top-0 h-20 w-2/3 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/60 transition hover:text-white"
        >
          ✕
        </button>

        <div className="relative p-7">
          <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            ScamRadar Account
          </div>
          <h2 className="text-2xl font-black text-white">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {mode === "login"
              ? "Access your history, watchlist, and Shield plan."
              : "Free to join. Your data synced across all devices."}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === "register" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setVerificationPending(false);
                setVerificationCode("");
                setNotice("");
              }}
              placeholder="Email address"
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setVerificationPending(false);
                setVerificationCode("");
                setNotice("");
              }}
              placeholder={mode === "register" ? "Password (min. 8 characters)" : "Password"}
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
            />
            {mode === "register" && verificationPending ? (
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit email code"
                className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
              />
            ) : null}

            {error && (
              <div className="rounded-xl border border-red-300/30 bg-red-500/15 px-4 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm text-cyan-100">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-black text-white transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : verificationPending
                    ? "Verify code & create account"
                    : "Create account"}
            </button>
            {mode === "register" && verificationPending ? (
              <button
                type="button"
                onClick={() => {
                  setVerificationPending(false);
                  setVerificationCode("");
                  setError("");
                  setNotice("Request a fresh code by pressing Create account.");
                }}
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.1]"
              >
                Request a new code
              </button>
            ) : null}
          </form>

          <div className="mt-4 text-center text-sm text-white/50">
            {mode === "login" ? (
              <>
                No account?{" "}
                <button onClick={() => { setMode("register"); setError(""); setNotice(""); setVerificationPending(false); }} className="text-cyan-400 hover:text-cyan-300">
                  Register free
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); setNotice(""); setVerificationPending(false); }} className="text-cyan-400 hover:text-cyan-300">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
