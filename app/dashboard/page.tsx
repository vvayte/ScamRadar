import Link from "next/link";
import db from "@/lib/db";
import { requireDashboardUser } from "@/lib/dashboardSession";
import { FREE_CHECK_LIMIT } from "@/lib/usage";

export default async function DashboardHomePage() {
  const user = await requireDashboardUser();

  const [recent, watchlistCount] = await Promise.all([
    db.historyItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.watchlistItem.count({ where: { userId: user.id } }),
  ]);

  const remainingFree = Math.max(0, FREE_CHECK_LIMIT - user.count);
  const usageLabel = user.premium
    ? "Shield active — unlimited checks"
    : user.credits > 0
      ? `${user.credits} paid check${user.credits === 1 ? "" : "s"} remaining`
      : `${remainingFree} of ${FREE_CHECK_LIMIT} free checks remaining`;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">Dashboard</div>
      <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">
        Welcome back{user.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-white/60">{usageLabel}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/checker"
          className="hover-lift rounded-2xl border border-white/12 bg-white/[0.04] p-6 transition"
        >
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Run a check</div>
          <div className="mt-2 text-lg font-semibold text-white">
            Paste a message, link, or screenshot
          </div>
          <p className="mt-2 text-sm text-white/55">
            ScamRadar highlights warning signs and tells you the safer next step.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#04080d]">
            Open checker →
          </div>
        </Link>

        {!user.premium && (
          <Link
            href="/dashboard/billing"
            className="hover-lift rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Upgrade</div>
            <div className="mt-2 text-lg font-semibold text-white">Shield — unlimited checks</div>
            <p className="mt-2 text-sm text-white/55">
              Full forensic breakdown, unlimited checks, and watchlist alerts.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/85">
              See plans
            </div>
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Recent checks</div>
            <Link href="/dashboard/history" className="text-xs text-white/55 hover:text-white">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-5 rounded-xl border border-white/8 bg-black/25 p-5 text-sm text-white/55">
              You have not run any checks yet.
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-white/8">
              {recent.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate text-white/85">{item.input.slice(0, 80) || "(image)"}</div>
                    <div className="mt-0.5 text-xs text-white/45">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="mono-readout flex-shrink-0 rounded-md border border-white/12 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-white/85">
                    {item.score}% · {item.level}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Watchlist</div>
            <Link href="/dashboard/watchlist" className="text-xs text-white/55 hover:text-white">
              Manage →
            </Link>
          </div>
          <div className="mt-4 text-3xl font-black text-white">{watchlistCount}</div>
          <p className="mt-1 text-sm text-white/55">
            {watchlistCount === 0
              ? "No watched indicators yet."
              : `Indicator${watchlistCount === 1 ? "" : "s"} you are tracking.`}
          </p>
        </div>
      </div>
    </div>
  );
}
