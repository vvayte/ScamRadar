import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

type PlanType = 'single' | 'monthly' | 'yearly' | 'flash';

const PLAN_CONFIG: Record<PlanType, { envKey: string; mode: 'payment' | 'subscription'; trialDays?: number }> = {
  single: { envKey: 'STRIPE_PRICE_ID_SINGLE', mode: 'payment' },
  monthly: { envKey: 'STRIPE_PRICE_ID_MONTHLY', mode: 'subscription', trialDays: 3 },
  yearly: { envKey: 'STRIPE_PRICE_ID_YEARLY', mode: 'subscription', trialDays: 3 },
  flash: { envKey: 'STRIPE_PRICE_ID_FLASH', mode: 'subscription' },
};

export async function POST(req: NextRequest) {
  try {
    const { type } = (await req.json()) as { type?: string };
    if (!type || !(type in PLAN_CONFIG)) {
      return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 });
    }

    const config = PLAN_CONFIG[type as PlanType];
    const priceId = process.env[config.envKey];

    if (!priceId) {
      return NextResponse.json({ error: `Price ID not configured for ${type}` }, { status: 500 });
    }

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel`;

    const sessionParams: any = {
      mode: config.mode,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (config.mode === 'subscription' && config.trialDays) {
      sessionParams.subscription_data = { trial_period_days: config.trialDays };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session', err);
    return NextResponse.json({ error: 'Could not create session' }, { status: 500 });
  }
}
