import type Stripe from "stripe";
import db from "@/lib/db";

export type PlanType = "lifetime" | "monthly" | "yearly" | "flash";
export type Currency = "usd" | "eur" | "gbp";

/**
 * Each plan has a default USD price ID and optional EUR / GBP overrides so
 * checkout can localize the currency. Configure separate Stripe prices in the
 * dashboard with the matching numeric amounts and point each env var at the
 * right price ID. If a regional ID is unset we silently fall back to USD.
 *
 * `lifetime` is a one-time payment that grants permanent Shield access — same
 * benefits as a subscription, but never auto-renews.
 */
export const PLAN_CONFIG: Record<
  PlanType,
  {
    envKey: string;
    eurEnvKey?: string;
    gbpEnvKey?: string;
    mode: "payment" | "subscription";
    credits: number;
    grantsLifetimePremium?: boolean;
  }
> = {
  lifetime: {
    envKey: "STRIPE_PRICE_ID_LIFETIME",
    eurEnvKey: "STRIPE_PRICE_ID_LIFETIME_EUR",
    gbpEnvKey: "STRIPE_PRICE_ID_LIFETIME_GBP",
    mode: "payment",
    credits: 0,
    grantsLifetimePremium: true,
  },
  monthly: {
    envKey: "STRIPE_PRICE_ID_MONTHLY",
    eurEnvKey: "STRIPE_PRICE_ID_MONTHLY_EUR",
    gbpEnvKey: "STRIPE_PRICE_ID_MONTHLY_GBP",
    mode: "subscription",
    credits: 0,
  },
  yearly: {
    envKey: "STRIPE_PRICE_ID_YEARLY",
    eurEnvKey: "STRIPE_PRICE_ID_YEARLY_EUR",
    gbpEnvKey: "STRIPE_PRICE_ID_YEARLY_GBP",
    mode: "subscription",
    credits: 0,
  },
  flash: {
    envKey: "STRIPE_PRICE_ID_FLASH",
    eurEnvKey: "STRIPE_PRICE_ID_FLASH_EUR",
    gbpEnvKey: "STRIPE_PRICE_ID_FLASH_GBP",
    mode: "subscription",
    credits: 0,
  },
};

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // Non-EU but EUR-using
  "IS", "LI", "MC", "ME", "VA", "AD", "SM",
]);

export function isPlanType(value: unknown): value is PlanType {
  return typeof value === "string" && value in PLAN_CONFIG;
}

/** Map an ISO country code to the currency we want to bill in. */
export function currencyForCountry(country: string | null | undefined): Currency {
  const code = (country || "").toUpperCase();
  if (code === "GB" || code === "UK" || code === "JE" || code === "GG" || code === "IM") return "gbp";
  if (EU_COUNTRIES.has(code)) return "eur";
  return "usd";
}

/** Read country code from common CDN/proxy headers (Cloudflare, Vercel). */
export function detectCountry(headers: Headers): string | null {
  return (
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code") ||
    null
  );
}

/**
 * Resolve the Stripe price ID for the requested plan and currency. Falls back
 * to the USD price ID (and "usd") if the regional override is not configured.
 */
export function resolvePriceForPlan(
  planType: PlanType,
  currency: Currency
): { priceId: string | null; currency: Currency } {
  const config = PLAN_CONFIG[planType];
  if (currency === "eur" && config.eurEnvKey && process.env[config.eurEnvKey]) {
    return { priceId: process.env[config.eurEnvKey] || null, currency: "eur" };
  }
  if (currency === "gbp" && config.gbpEnvKey && process.env[config.gbpEnvKey]) {
    return { priceId: process.env[config.gbpEnvKey] || null, currency: "gbp" };
  }
  return { priceId: process.env[config.envKey] || null, currency: "usd" };
}

function getPlanTypeFromSession(session: Stripe.Checkout.Session): PlanType | null {
  const metadataPlan = session.metadata?.planType;
  if (isPlanType(metadataPlan)) return metadataPlan;

  const priceId = (session as any).line_items?.data?.[0]?.price?.id;
  for (const [plan, config] of Object.entries(PLAN_CONFIG) as Array<[PlanType, (typeof PLAN_CONFIG)[PlanType]]>) {
    const candidates = [
      process.env[config.envKey],
      config.eurEnvKey ? process.env[config.eurEnvKey] : undefined,
      config.gbpEnvKey ? process.env[config.gbpEnvKey] : undefined,
    ].filter(Boolean);
    if (priceId && candidates.includes(priceId)) return plan;
  }

  return null;
}

function getCheckoutRefs(session: Stripe.Checkout.Session): {
  userId: string | null;
  anonymousKey: string | null;
  customerId: string | null;
  subscriptionId: string | null;
} {
  const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscription =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  return {
    userId: session.metadata?.userId || null,
    anonymousKey: session.metadata?.anonymousKey || null,
    customerId: customer || null,
    subscriptionId: subscription || null,
  };
}

export async function applyCheckoutSession(session: Stripe.Checkout.Session) {
  const planType = getPlanTypeFromSession(session);
  if (!planType) throw new Error("Unknown checkout plan.");

  const config = PLAN_CONFIG[planType];
  const refs = getCheckoutRefs(session);
  const priceId = (session as any).line_items?.data?.[0]?.price?.id || process.env[config.envKey] || "";
  const isSubscription = config.mode === "subscription";
  const grantsLifetime = !!config.grantsLifetimePremium;
  const grantsPremium = isSubscription || grantsLifetime;

  return db.$transaction(async (tx) => {
    const existing = await tx.stripeCheckoutSession.findUnique({ where: { id: session.id } });
    if (existing?.applied) {
      return {
        planType,
        applied: false,
        userId: existing.userId,
        anonymousKey: existing.anonymousKey,
      };
    }

    await tx.stripeCheckoutSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        planType,
        mode: session.mode || config.mode,
        priceId,
        userId: refs.userId,
        anonymousKey: refs.anonymousKey,
        applied: true,
      },
      update: {
        planType,
        mode: session.mode || config.mode,
        priceId,
        userId: refs.userId,
        anonymousKey: refs.anonymousKey,
        applied: true,
      },
    });

    const subscriptionStatusValue = isSubscription
      ? "active"
      : grantsLifetime
        ? "lifetime"
        : null;

    if (refs.userId) {
      await tx.user.update({
        where: { id: refs.userId },
        data: grantsPremium
          ? {
              premium: true,
              stripeCustomerId: refs.customerId || undefined,
              ...(isSubscription
                ? { stripeSubscriptionId: refs.subscriptionId || undefined }
                : {}),
              ...(subscriptionStatusValue
                ? { subscriptionStatus: subscriptionStatusValue }
                : {}),
            }
          : {
              credits: { increment: config.credits },
              stripeCustomerId: refs.customerId || undefined,
            },
      });
    } else if (refs.anonymousKey) {
      await tx.anonymousUsage.upsert({
        where: { key: refs.anonymousKey },
        create: {
          key: refs.anonymousKey,
          premium: grantsPremium,
          credits: grantsPremium ? 0 : config.credits,
          stripeCustomerId: refs.customerId || undefined,
          stripeSubscriptionId: refs.subscriptionId || undefined,
          subscriptionStatus: subscriptionStatusValue || undefined,
        },
        update: grantsPremium
          ? {
              premium: true,
              stripeCustomerId: refs.customerId || undefined,
              ...(isSubscription
                ? { stripeSubscriptionId: refs.subscriptionId || undefined }
                : {}),
              ...(subscriptionStatusValue
                ? { subscriptionStatus: subscriptionStatusValue }
                : {}),
            }
          : {
              credits: { increment: config.credits },
              stripeCustomerId: refs.customerId || undefined,
            },
      });
    }

    return {
      planType,
      applied: true,
      userId: refs.userId,
      anonymousKey: refs.anonymousKey,
    };
  });
}

export async function applySubscriptionStatus(subscription: Stripe.Subscription) {
  const premium = subscription.status === "active" || subscription.status === "trialing";
  const subscriptionId = subscription.id;

  await db.$transaction([
    db.user.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { premium, subscriptionStatus: subscription.status },
    }),
    db.anonymousUsage.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { premium, subscriptionStatus: subscription.status },
    }),
  ]);
}
