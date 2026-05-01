import Link from "next/link";
import db from "@/lib/db";
import { requireDashboardUser } from "@/lib/dashboardSession";

function parseReasons(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String).slice(0, 3) : [];
  } catch {
    return [];
  }
}

export default async function HistoryPage() {
  const user = await requireDashboardUser();
  const items = await db.historyItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">History</div>
      <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Your previous checks</h1>
      <p className="mt-2 text-sm text-white/55">The last 50 analyses tied to this account.</p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.025] p-8 text-center">
          <div className="text-base font-semibold text-white">No checks yet</div>
          <p className="mt-1 text-sm text-white/55">
            Run your first analysis to start building a history of decisions.
          </p>
          <Link
            href="/dashboard/checker"
            className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#04080d] hover:bg-white/90"
          >
            Open checker →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => {
            const reasons = parseReasons(item.reasons);
            return (
              <li key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/45">
                      {new Date(item.createdAt).toLocaleString()}
                      {item.hasImage ? " · screenshot" : ""}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-white/85">
                      {item.input.slice(0, 320) || "(image only)"}
                    </div>
                    {reasons.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-white/8 bg-black/30 px-2 py-1 text-[11px] text-white/65"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span className="mono-readout flex-shrink-0 rounded-md border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/85">
                    {item.score}% · {item.level}
                  </span>
                </div>
                {item.advice ? (
                  <div className="mt-3 rounded-xl border border-white/8 bg-black/25 px-4 py-3 text-xs leading-6 text-white/65">
                    {item.advice}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
