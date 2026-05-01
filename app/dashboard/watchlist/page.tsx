import db from "@/lib/db";
import { requireDashboardUser } from "@/lib/dashboardSession";
import WatchlistManager from "@/components/WatchlistManager";

export default async function WatchlistPage() {
  const user = await requireDashboardUser();
  const items = await db.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">Watchlist</div>
      <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Track suspicious indicators</h1>
      <p className="mt-2 text-sm text-white/55">
        Add domains, phone numbers, usernames, or keywords you want ScamRadar to flag in future checks.
      </p>
      <div className="mt-8">
        <WatchlistManager initial={items.map((item) => item.value)} />
      </div>
    </div>
  );
}
