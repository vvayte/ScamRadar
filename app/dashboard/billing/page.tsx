import { headers } from "next/headers";
import db from "@/lib/db";
import { requireDashboardUser } from "@/lib/dashboardSession";
import { FREE_CHECK_LIMIT } from "@/lib/usage";
import { currencyForCountry, detectCountry } from "@/lib/billing";
import BillingPanel from "@/components/BillingPanel";

export default async function BillingPage() {
  const user = await requireDashboardUser();
  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: { subscriptionStatus: true },
  });

  const country = detectCountry(headers());
  const currency = currencyForCountry(country);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">Billing</div>
      <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Plan & checkout</h1>
      <p className="mt-2 text-sm text-white/55">
        Upgrade for unlimited checks, or buy a single check when you only need one urgent answer.
      </p>
      <div className="mt-8">
        <BillingPanel
          status={{
            premium: user.premium,
            credits: user.credits,
            count: user.count,
            freeLimit: FREE_CHECK_LIMIT,
            subscriptionStatus: fullUser?.subscriptionStatus ?? null,
          }}
          detectedCurrency={currency}
        />
      </div>
    </div>
  );
}
