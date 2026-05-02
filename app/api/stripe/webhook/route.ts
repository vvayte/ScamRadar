import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import db from "@/lib/db";
import { applyCheckoutSession, applySubscriptionStatus } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event;
  try {
    const payload = await req.text();
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    const existing = await db.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing) return NextResponse.json({ ok: true, duplicate: true });

    if (event.type === "checkout.session.completed") {
      await applyCheckoutSession(event.data.object as any);
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await applySubscriptionStatus(event.data.object as any);
    }

    // Re-sync subscription on payment failure so we can mark the user past_due
    // immediately rather than waiting for Stripe to re-emit subscription.updated.
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as { subscription?: string | null };
      if (invoice.subscription) {
        try {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          await applySubscriptionStatus(sub);
        } catch (err) {
          console.error("Failed to sync subscription on payment_failed", err);
        }
      }
    }

    await db.stripeEvent.create({ data: { id: event.id, type: event.type } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Stripe webhook handling failed", error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
