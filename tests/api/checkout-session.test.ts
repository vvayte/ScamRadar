import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSessionMock } = vi.hoisted(() => ({
  createSessionMock: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  default: {
    checkout: {
      sessions: {
        create: createSessionMock,
      },
    },
  },
}));

import { POST } from '@/app/api/checkout/session/route';

describe('POST /api/checkout/session', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      STRIPE_PRICE_ID_SINGLE: 'price_single',
      STRIPE_PRICE_ID_PACK: 'price_pack',
      STRIPE_PRICE_ID_SUBSCRIPTION: 'price_subscription',
    };
  });

  it('returns 400 for an invalid purchase type', async () => {
    const request = new Request('http://localhost/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'invalid' }),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid purchase type' });
  });

  it('creates a subscription checkout session', async () => {
    createSessionMock.mockResolvedValue({ url: 'https://checkout.stripe.test/session' });

    const request = new Request('http://localhost/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'subscription' }),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: 'https://checkout.stripe.test/session',
    });
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        success_url:
          'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/cancel',
      }),
    );
  });
});
