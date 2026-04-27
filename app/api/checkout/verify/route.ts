import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

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

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session not paid' }, { status: 400 });
    }

    let premium = false;
    let credits = 0;

    if (session.mode === 'subscription') {
      premium = true;
    } else {
      // Determine credits based on purchased price ID
      const line = (session as any).line_items?.data?.[0];
      const priceId: string | undefined = line?.price?.id;
      if (priceId === process.env.STRIPE_PRICE_ID_SINGLE) {
        credits = 1;
      } else if (priceId === process.env.STRIPE_PRICE_ID_PACK) {
        credits = 5;
      }
    }

    return NextResponse.json({ premium, credits });
  } catch (err) {
    console.error('Error verifying checkout session', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}