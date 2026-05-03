import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { applyCheckoutSession, PLAN_CONFIG } from '@/lib/billing';
import { ANON_USAGE_COOKIE } from '@/lib/usage';

/**
 * Verifies a Stripe checkout session and returns premium status and credit count.
 * This endpoint is intentionally simple and trusts the payment status returned by Stripe.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe secret key is not configured.' }, { status: 503 });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'] as any,
    });

    const paymentComplete =
      session?.payment_status === 'paid' ||
      (session?.mode === 'subscription' && session?.payment_status === 'no_payment_required');

    if (!session || !paymentComplete) {
      return NextResponse.json({ error: 'Session not paid' }, { status: 400 });
    }

    const applied = await applyCheckoutSession(session);

    const planType = applied.planType;
    const config = planType ? PLAN_CONFIG[planType] : undefined;
    const grantsLifetime = !!config?.grantsLifetimePremium;
    const premium = session.mode === 'subscription' || grantsLifetime;
    // Lifetime and subscriptions don't add per-check credits — they grant premium.
    const credits = premium ? 0 : config?.credits ?? 0;
    const response = NextResponse.json({ premium, credits, applied });
    if (applied.anonymousKey) {
      response.cookies.set(ANON_USAGE_COOKIE, applied.anonymousKey, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      });
    }
    return response;
  } catch (err) {
    console.error('Error verifying checkout session', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
