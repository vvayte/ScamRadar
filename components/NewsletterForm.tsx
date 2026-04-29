"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("Monthly. Scam trends, never spam.");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setMessage("Monthly. Scam trends, never spam.");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error || "Could not subscribe. Please try again.");
        return;
      }

      setStatus("done");
      setEmail("");
      setMessage("Subscribed. Watch your inbox for security tips.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div>
      <form className="mt-6 flex flex-wrap gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email for security tips"
          aria-label="Email for newsletter"
          className="input-field min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/50"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="press rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:opacity-60"
        >
          {status === "sending" ? "..." : status === "done" ? "Subscribed" : "Subscribe"}
        </button>
      </form>
      <p className={`mt-2 text-xs ${status === "error" ? "text-rose-200" : "text-white/45"}`}>
        {message}
      </p>
    </div>
  );
}
