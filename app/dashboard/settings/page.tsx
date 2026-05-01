import { requireDashboardUser } from "@/lib/dashboardSession";
import SettingsPanel from "@/components/SettingsPanel";

export default async function SettingsPage() {
  const user = await requireDashboardUser();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@scamradar.app";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">Settings</div>
      <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Account</h1>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Email</div>
          <div className="mt-2 text-base text-white">{user.email}</div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Account created</div>
          <div className="mt-2 text-base text-white">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Privacy & data</div>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Your history and watchlist are stored only in your account. To request data deletion, contact{" "}
            <a href={`mailto:${supportEmail}`} className="text-white hover:underline">
              {supportEmail}
            </a>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Session</div>
          <div className="mt-3">
            <SettingsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
