import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createSessionMock,
  userFindUniqueMock,
  stripeCheckoutSessionUpsertMock,
  getSessionUserMock,
  resolveUsageSubjectMock,
  attachAnonymousCookieMock,
} = vi.hoisted(() => ({
  createSessionMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  stripeCheckoutSessionUpsertMock: vi.fn(),
  getSessionUserMock: vi.fn(),
  resolveUsageSubjectMock: vi.fn(),
  attachAnonymousCookieMock: vi.fn(),
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

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: userFindUniqueMock,
    },
    stripeCheckoutSession: {
      upsert: stripeCheckoutSessionUpsertMock,
    },
  },
}));

vi.mock('@/lib/usage', () => ({
  ANON_USAGE_COOKIE: 'sr_anon',
  getSessionUser: getSessionUserMock,
  resolveUsageSubject: resolveUsageSubjectMock,
  attachAnonymousCookie: attachAnonymousCookieMock,
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
      STRIPE_PRICE_ID_MONTHLY: 'price_monthly',
      STRIPE_PRICE_ID_YEARLY: 'price_yearly',
      STRIPE_PRICE_ID_FLASH: 'price_flash',
    };
    getSessionUserMock.mockResolvedValue(null);
    resolveUsageSubjectMock.mockResolvedValue({
      kind: 'anonymous',
      anonymous: { key: 'anon_test', premium: false, credits: 0, count: 0 },
      anonymousKey: 'anon_test',
      setAnonymousCookie: false,
    });
    attachAnonymousCookieMock.mockImplementation((response) => response);
    stripeCheckoutSessionUpsertMock.mockResolvedValue({});
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

  it('creates a monthly subscription checkout session', async () => {
    createSessionMock.mockResolvedValue({
      id: 'cs_test_monthly',
      url: 'https://checkout.stripe.test/session',
    });

    const request = new Request('http://localhost/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'monthly' }),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: 'https://checkout.stripe.test/session',
    });
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: [{ price: 'price_monthly', quantity: 1 }],
        subscription_data: { trial_period_days: 3 },
        metadata: {
          planType: 'monthly',
          userId: '',
          anonymousKey: 'anon_test',
        },
        client_reference_id: 'anon_test',
        success_url:
          'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/cancel',
      }),
    );
    expect(stripeCheckoutSessionUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cs_test_monthly' },
      }),
    );
  });
});
