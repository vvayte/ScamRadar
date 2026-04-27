"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing your purchase...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setMessage("Missing session information.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (data && !data.error) {
          const currentCredits = parseInt(localStorage.getItem("scamRadarCredits") ?? "0");

          if (data.premium) {
            localStorage.setItem("scamRadarPremium", "true");
            localStorage.setItem("scamRadarCredits", "0");
            setMessage("Subscription activated. You now have unlimited scam checks.");
          } else {
            const newCredits = currentCredits + (data.credits ?? 0);
            localStorage.setItem("scamRadarCredits", newCredits.toString());
            setMessage(`Payment confirmed. You now have ${newCredits} check${newCredits === 1 ? "" : "s"}.`);
          }
        } else {
          setMessage("Unable to verify purchase.");
        }
      } catch (error) {
        console.error(error);
        setMessage("An error occurred while verifying your purchase.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <main className="site-shell flex min-h-screen items-center justify-center px-4 py-12 text-white">
      <div className="fade-in-up w-full max-w-xl rounded-[32px] border border-cyan-300/35 bg-black/35 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/35 bg-emerald-500/20">
          <span className="text-2xl text-emerald-200">✓</span>
        </div>

        <h1 className="text-3xl font-black md:text-4xl">Payment Successful</h1>
        <p className="mt-4 text-base leading-7 text-white/75">{message}</p>

        <button
          onClick={() => router.push("/")}
          disabled={loading}
          className="mt-7 rounded-2xl bg-cyan-500 px-6 py-3 text-base font-black text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {loading ? "Verifying..." : "Back to checker"}
        </button>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="site-shell flex min-h-screen items-center justify-center px-4 py-12 text-white">
          <div className="w-full max-w-xl rounded-[32px] border border-cyan-300/35 bg-black/35 p-8 text-center">
            <h1 className="text-3xl font-black md:text-4xl">Payment Successful</h1>
            <p className="mt-4 text-base leading-7 text-white/75">Processing your purchase...</p>
          </div>
        </main>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
