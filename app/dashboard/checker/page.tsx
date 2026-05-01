import { requireDashboardUser } from "@/lib/dashboardSession";
import CheckerPanel from "@/components/CheckerPanel";

export default async function DashboardCheckerPage() {
  await requireDashboardUser();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">Checker</div>
      <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Analyze a suspicious message</h1>
      <p className="mt-2 text-sm text-white/55">
        ScamRadar reads text, URLs, and screenshots. The result is dynamic — only signals and artifacts that were actually computed for your input are shown.
      </p>
      <div className="mt-8">
        <CheckerPanel />
      </div>
    </div>
  );
}
