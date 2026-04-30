import type Stripe from "stripe";
import db from "@/lib/db";

export type PlanType = "single" | "monthly" | "yearly" | "flash";

export const PLAN_CONFIG: Record<
  PlanType,
  { envKey: string; mode: "payment" | "subscription"; credits: number }
> = {
  single: { envKey: "STRIPE_PRICE_ID_SINGLE", mode: "payment", credits: 1 },
  monthly: { envKey: "STRIPE_PRICE_ID_MONTHLY", mode: "subscription", credits: 0 },
  yearly: { envKey: "STRIPE_PRICE_ID_YEARLY", mode: "subscription", credits: 0 },
  flash: { envKey: "STRIPE_PRICE_ID_FLASH", mode: "subscription", credits: 0 },
};

export function isPlanType(value: unknown): value is PlanType {
  return typeof value === "string" && value in PLAN_CONFIG;
}

function getPlanTypeFromSession(session: Stripe.Checkout.Session): PlanType | null {
  const metadataPlan = session.metadata?.planType;
  if (isPlanType(metadataPlan)) return metadataPlan;

  const priceId = (session as any).line_items?.data?.[0]?.price?.id;
  for (const [plan, config] of Object.entries(PLAN_CONFIG) as Array<[PlanType, (typeof PLAN_CONFIG)[PlanType]]>) {
    if (priceId && process.env[config.envKey] === priceId) return plan;
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

    if (refs.userId) {
      await tx.user.update({
        where: { id: refs.userId },
        data: isSubscription
          ? {
              premium: true,
              stripeCustomerId: refs.customerId || undefined,
              stripeSubscriptionId: refs.subscriptionId || undefined,
              subscriptionStatus: "active",
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
          premium: isSubscription,
          credits: isSubscription ? 0 : config.credits,
          stripeCustomerId: refs.customerId || undefined,
          stripeSubscriptionId: refs.subscriptionId || undefined,
          subscriptionStatus: isSubscription ? "active" : undefined,
        },
        update: isSubscription
          ? {
              premium: true,
              stripeCustomerId: refs.customerId || undefined,
              stripeSubscriptionId: refs.subscriptionId || undefined,
              subscriptionStatus: "active",
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
