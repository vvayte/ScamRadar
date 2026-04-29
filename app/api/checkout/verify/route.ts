import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { applyCheckoutSession } from '@/lib/billing';
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
  try {
    // Retrieve the session and line items to determine what was purchased
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

    const premium = session.mode === 'subscription';
    const credits = premium ? 0 : applied.planType === 'single' ? 1 : 0;
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
