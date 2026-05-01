import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import db from '@/lib/db';
import {
  PLAN_CONFIG,
  currencyForCountry,
  detectCountry,
  isPlanType,
  resolvePriceForPlan,
} from '@/lib/billing';
import {
  ANON_USAGE_COOKIE,
  attachAnonymousCookie,
  getSessionUser,
  resolveUsageSubject,
} from '@/lib/usage';

export async function POST(req: NextRequest) {
  try {
    const { type } = (await req.json()) as { type?: string };
    if (!isPlanType(type)) {
      return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe secret key is not configured.' }, { status: 503 });
    }

    const config = PLAN_CONFIG[type];
    const country = detectCountry(req.headers);
    const desiredCurrency = currencyForCountry(country);
    const { priceId, currency } = resolvePriceForPlan(type, desiredCurrency);

    if (!priceId) {
      return NextResponse.json({ error: `Price ID not configured for ${type}` }, { status: 500 });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, '');
    const successUrl = `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/cancel`;
    const user = await getSessionUser(req);
    const subject = user ? null : await resolveUsageSubject(req);
    const anonymousKey = subject?.kind === 'anonymous' ? subject.anonymousKey : undefined;

    const sessionParams: any = {
      mode: config.mode,
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planType: type,
        userId: user?.id || '',
        anonymousKey: anonymousKey || '',
        country: country || '',
        currency,
      },
      client_reference_id: user?.id || anonymousKey,
    };

    if (user) {
      const fullUser = await db.user.findUnique({ where: { id: user.id } });
      if (fullUser?.stripeCustomerId) sessionParams.customer = fullUser.stripeCustomerId;
      else sessionParams.customer_email = fullUser?.email || user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    await db.stripeCheckoutSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        planType: type,
        mode: config.mode,
        priceId,
        userId: user?.id || null,
        anonymousKey: anonymousKey || null,
      },
      update: {
        planType: type,
        mode: config.mode,
        priceId,
        userId: user?.id || null,
        anonymousKey: anonymousKey || null,
      },
    });

    const response = NextResponse.json({ url: session.url, currency });
    if (subject) {
      attachAnonymousCookie(response, subject);
    } else if (req.cookies.get(ANON_USAGE_COOKIE)?.value) {
      response.cookies.set(ANON_USAGE_COOKIE, '', { maxAge: 0, path: '/' });
    }
    return response;
  } catch (err) {
    console.error('Error creating checkout session', err);
    return NextResponse.json({ error: 'Could not create session' }, { status: 500 });
  }
}
