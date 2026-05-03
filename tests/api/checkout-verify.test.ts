import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { retrieveSessionMock, applyCheckoutSessionMock } = vi.hoisted(() => ({
  retrieveSessionMock: vi.fn(),
  applyCheckoutSessionMock: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  default: {
    checkout: {
      sessions: {
        retrieve: retrieveSessionMock,
      },
    },
  },
}));

vi.mock('@/lib/billing', () => ({
  applyCheckoutSession: applyCheckoutSessionMock,
  PLAN_CONFIG: {
    monthly: { credits: 0 },
    single: { credits: 1 },
  },
}));

import { GET } from '@/app/api/checkout/verify/route';

describe('GET /api/checkout/verify', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_dummy',
      STRIPE_PRICE_ID_SINGLE: 'price_single',
      STRIPE_PRICE_ID_PACK: 'price_pack',
    };
    applyCheckoutSessionMock.mockResolvedValue({
      planType: 'monthly',
      applied: true,
      userId: 'user_123',
      anonymousKey: null,
    });
  });

  it('returns 400 when session_id is missing', async () => {
    const request = new NextRequest('http://localhost/api/checkout/verify');

    const response = await GET(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Missing session_id' });
  });

  it('returns premium status for paid subscriptions', async () => {
    retrieveSessionMock.mockResolvedValue({
      payment_status: 'paid',
      mode: 'subscription',
    });
    applyCheckoutSessionMock.mockResolvedValue({
      planType: 'monthly',
      applied: true,
      userId: 'user_123',
      anonymousKey: null,
    });

    const request = new NextRequest(
      'http://localhost/api/checkout/verify?session_id=cs_test_subscription',
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      premium: true,
      credits: 0,
      applied: {
        planType: 'monthly',
        applied: true,
        userId: 'user_123',
        anonymousKey: null,
      },
    });
  });

  it('returns credit count for paid single-check purchases', async () => {
    retrieveSessionMock.mockResolvedValue({
      payment_status: 'paid',
      mode: 'payment',
      line_items: {
        data: [
          {
            price: {
              id: 'price_single',
            },
          },
        ],
      },
    });
    applyCheckoutSessionMock.mockResolvedValue({
      planType: 'single',
      applied: true,
      userId: null,
      anonymousKey: 'anon_test',
    });

    const request = new NextRequest(
      'http://localhost/api/checkout/verify?session_id=cs_test_single',
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      premium: false,
      credits: 1,
      applied: {
        planType: 'single',
        applied: true,
        userId: null,
        anonymousKey: 'anon_test',
      },
    });
  });
});
