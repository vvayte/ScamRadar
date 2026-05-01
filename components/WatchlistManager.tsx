"use client";

import { useState } from "react";

export default function WatchlistManager({ initial }: { initial: string[] }) {
  const [items, setItems] = useState<string[]>(initial);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || pending) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not add.");
        return;
      }
      setItems(data.watchlist || []);
      setValue("");
    } finally {
      setPending(false);
    }
  };

  const remove = async (target: string) => {
    setError("");
    setItems((prev) => prev.filter((i) => i !== target));
    const res = await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: target }),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data?.watchlist)) {
      setItems(data.watchlist);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-5 sm:flex-row sm:items-center">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Domain, phone number, username, or keyword"
          className="input-field w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#04080d] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </form>

      {error ? (
        <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-8 text-center">
          <div className="text-base font-semibold text-white">No watched indicators yet</div>
          <p className="mt-1 text-sm text-white/55">
            Add suspicious domains, phone numbers, usernames, or keywords. ScamRadar will flag them in future checks.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.025]">
          {items.map((item) => (
            <li key={item} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="truncate text-white/85">{item}</span>
              <button
                type="button"
                onClick={() => remove(item)}
                className="rounded-md border border-white/12 px-3 py-1 text-xs font-semibold text-white/65 hover:text-white"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
