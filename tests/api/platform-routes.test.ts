import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  consumeRateLimitMock,
  getClientIpMock,
  requestMagicLinkMock,
  sendMagicLinkEmailIfConfiguredMock,
  verifyMagicLinkMock,
  getOrCreateUserProfileMock,
  getSessionEmailMock,
  syncUserProfileMock,
  submitThreatReportMock,
  applyRulesMock,
  inspectListingUrlsFromTextMock,
  createCompletionMock,
} = vi.hoisted(() => ({
  consumeRateLimitMock: vi.fn(),
  getClientIpMock: vi.fn(),
  requestMagicLinkMock: vi.fn(),
  sendMagicLinkEmailIfConfiguredMock: vi.fn(),
  verifyMagicLinkMock: vi.fn(),
  getOrCreateUserProfileMock: vi.fn(),
  getSessionEmailMock: vi.fn(),
  syncUserProfileMock: vi.fn(),
  submitThreatReportMock: vi.fn(),
  applyRulesMock: vi.fn(),
  inspectListingUrlsFromTextMock: vi.fn(),
  createCompletionMock: vi.fn(),
}));

vi.mock('@/lib/requestGuard', () => ({
  consumeRateLimit: consumeRateLimitMock,
  getClientIp: getClientIpMock,
}));

vi.mock('@/lib/platformDataStore', () => ({
  requestMagicLink: requestMagicLinkMock,
  sendMagicLinkEmailIfConfigured: sendMagicLinkEmailIfConfiguredMock,
  verifyMagicLink: verifyMagicLinkMock,
  getOrCreateUserProfile: getOrCreateUserProfileMock,
  getSessionEmail: getSessionEmailMock,
  syncUserProfile: syncUserProfileMock,
}));

vi.mock('@/lib/communityIntel', () => ({
  submitThreatReport: submitThreatReportMock,
}));

vi.mock('@/lib/scamRules', () => ({
  applyRules: applyRulesMock,
}));

vi.mock('@/lib/urlInspector', () => ({
  inspectListingUrlsFromText: inspectListingUrlsFromTextMock,
}));

vi.mock('@/lib/openaiClient', () => ({
  default: {
    chat: {
      completions: {
        create: createCompletionMock,
      },
    },
  },
}));

import { POST as requestLinkPost } from '@/app/api/auth/request-link/route';
import { POST as verifyPost } from '@/app/api/auth/verify/route';
import { GET as accountGet, POST as accountPost } from '@/app/api/account/route';
import { POST as reportPost } from '@/app/api/report/route';
import { POST as botAnalyzePost } from '@/app/api/bot/analyze/route';

const DEFAULT_PROFILE = {
  email: 'user@example.com',
  premium: false,
  credits: 2,
  count: 1,
  history: [],
  watchlist: [],
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

describe('Platform API routes', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env = {
      ...originalEnv,
      BOT_API_TOKEN: 'bot_secret',
    };

    consumeRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 10,
      retryAfterSeconds: 60,
    });
    getClientIpMock.mockReturnValue('127.0.0.1');

    requestMagicLinkMock.mockReturnValue({
      token: 'magic_123',
      expiresAt: 1_700_000_000_000,
    });
    sendMagicLinkEmailIfConfiguredMock.mockResolvedValue({
      delivered: false,
      provider: 'none',
    });
    verifyMagicLinkMock.mockReturnValue({
      sessionToken: 'session_123',
      email: 'user@example.com',
    });
    getOrCreateUserProfileMock.mockReturnValue(DEFAULT_PROFILE);
    getSessionEmailMock.mockReturnValue('user@example.com');
    syncUserProfileMock.mockReturnValue({
      ...DEFAULT_PROFILE,
      count: 3,
    });
    submitThreatReportMock.mockReturnValue({
      id: 'report_123',
      createdAt: '2026-04-01T10:00:00.000Z',
      indicatorType: 'url',
      indicatorValue: 'https://market.example/item/1',
      platform: 'market',
      notes: 'fake escrow',
      reporterEmail: 'user@example.com',
    });

    inspectListingUrlsFromTextMock.mockResolvedValue({
      urls: [],
      extractedText: '',
      riskHints: [],
      fetchErrors: [],
    });
    applyRulesMock.mockReturnValue({
      score: 84,
      level: 'High',
      reasons: ['Urgent transfer request'],
      advice: 'Do not send payment.',
      skipAI: true,
    });
    createCompletionMock.mockResolvedValue({
      choices: [{ message: { content: '{"score":50,"level":"Medium","reasons":[],"advice":"Verify."}' } }],
    });
  });

  describe('POST /api/auth/request-link', () => {
    it('returns 400 for invalid email', async () => {
      const request = new Request('http://localhost/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      });

      const response = await requestLinkPost(request as any);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: 'Please enter a valid email address.',
      });
      expect(requestMagicLinkMock).not.toHaveBeenCalled();
    });

    it('creates a magic link in dev delivery mode', async () => {
      const request = new Request('http://localhost/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'USER@Example.com',
          origin: 'https://scamradar.app/',
        }),
      });

      const response = await requestLinkPost(request as any);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.ok).toBe(true);
      expect(payload.magicLink).toBe('https://scamradar.app/?magic_token=magic_123');
      expect(requestMagicLinkMock).toHaveBeenCalledWith('user@example.com');
    });
  });

  describe('POST /api/auth/verify', () => {
    it('returns 400 when token is missing', async () => {
      const request = new Request('http://localhost/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await verifyPost(request as any);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'Missing token.' });
    });

    it('returns session token and profile when token is valid', async () => {
      const request = new Request('http://localhost/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'magic_123' }),
      });

      const response = await verifyPost(request as any);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({
        ok: true,
        sessionToken: 'session_123',
        profile: DEFAULT_PROFILE,
      });
    });
  });

  describe('Account and report APIs', () => {
    it('returns 401 for account GET when auth is invalid', async () => {
      getSessionEmailMock.mockReturnValueOnce(null);

      const request = new Request('http://localhost/api/account', {
        headers: { Authorization: 'Bearer bad_token' },
      });

      const response = await accountGet(request as any);

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Unauthorized.' });
    });

    it('syncs account profile via POST', async () => {
      const request = new Request('http://localhost/api/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer session_123',
        },
        body: JSON.stringify({
          premium: true,
          credits: 9,
          count: 4,
          history: [],
          watchlist: ['seller-risky'],
        }),
      });

      const response = await accountPost(request as any);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.ok).toBe(true);
      expect(syncUserProfileMock).toHaveBeenCalledWith('user@example.com', {
        premium: true,
        credits: 9,
        count: 4,
        history: [],
        watchlist: ['seller-risky'],
      });
    });

    it('returns 400 for report submission without indicator', async () => {
      const request = new Request('http://localhost/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'missing value' }),
      });

      const response = await reportPost(request as any);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: 'Indicator value is required.',
      });
    });

    it('accepts report submission and returns report id', async () => {
      const request = new Request('http://localhost/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicatorType: 'url',
          indicatorValue: 'https://market.example/item/1',
          platform: 'market',
          notes: 'fake escrow request',
          reporterEmail: 'user@example.com',
        }),
      });

      const response = await reportPost(request as any);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ ok: true, reportId: 'report_123' });
      expect(submitThreatReportMock).toHaveBeenCalled();
    });
  });

  describe('POST /api/bot/analyze', () => {
    it('returns 401 when bot token is invalid', async () => {
      const request = new Request('http://localhost/api/bot/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-token': 'wrong-token',
        },
        body: JSON.stringify({ text: 'hello' }),
      });

      const response = await botAnalyzePost(request as any);

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: 'Unauthorized bot request.',
      });
    });

    it('returns heuristic response without OpenAI when rules are confident', async () => {
      const request = new Request('http://localhost/api/bot/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-token': 'bot_secret',
        },
        body: JSON.stringify({
          text: 'Urgent payment request by wire transfer',
        }),
      });

      const response = await botAnalyzePost(request as any);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({
        score: 84,
        level: 'High',
        reasons: ['Urgent transfer request'],
        advice: 'Do not send payment.',
        skipAI: true,
        source: 'heuristic',
      });
      expect(createCompletionMock).not.toHaveBeenCalled();
    });

    it('calibrates benign marketplace links the same way as the web checker', async () => {
      const url = 'https://www.amazon.com/dp/B0CNCL35CH/ref=hw_26_a_dag_c_053';
      applyRulesMock.mockReturnValueOnce({
        score: 0,
        level: 'Low',
        reasons: [],
        advice: 'Appears safe, but stay vigilant.',
        skipAI: false,
      });
      inspectListingUrlsFromTextMock.mockResolvedValueOnce({
        urls: [url],
        extractedText: `[Source URL] ${url}\n[Marketplace Platform] Amazon`,
        riskHints: [],
        fetchErrors: [],
        trustedMarketplaceHosts: ['www.amazon.com'],
        hardRiskSignals: [],
        softRiskSignals: [],
        trustSignals: ['Known marketplace domain: Amazon'],
      });
      createCompletionMock.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 90,
                level: 'High',
                reasons: ['Unsolicited link in text', 'Potential fake product'],
                advice: 'Do not proceed.',
              }),
            },
          },
        ],
      });

      const request = new Request('http://localhost/api/bot/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-token': 'bot_secret',
        },
        body: JSON.stringify({ text: url }),
      });

      const response = await botAnalyzePost(request as any);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.source).toBe('ai');
      expect(payload.level).toBe('Low');
      expect(payload.score).toBeLessThanOrEqual(30);
      expect(payload.reasons.join(' ')).not.toMatch(/unsolicited|fake product/i);
    });

    it('keeps completed Russian transaction messages low in the bot API', async () => {
      const text =
        'я получил товар, все прошло прекрасно, товар себя оправдал, только потом я скинул деньги за этот товар';
      applyRulesMock.mockReturnValueOnce({
        score: 0,
        level: 'Low',
        reasons: [],
        advice: 'Appears safe, but stay vigilant.',
        skipAI: false,
      });
      inspectListingUrlsFromTextMock.mockResolvedValueOnce({
        urls: [],
        extractedText: '',
        riskHints: [],
        fetchErrors: [],
        trustedMarketplaceHosts: [],
        hardRiskSignals: [],
        softRiskSignals: [],
        trustSignals: [],
      });
      createCompletionMock.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 85,
                level: 'High',
                reasons: ['Money was sent after a purchase'],
                advice: 'Do not proceed.',
              }),
            },
          },
        ],
      });

      const request = new Request('http://localhost/api/bot/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-token': 'bot_secret',
        },
        body: JSON.stringify({ text }),
      });

      const response = await botAnalyzePost(request as any);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.level).toBe('Low');
      expect(payload.score).toBeLessThanOrEqual(25);
      expect(payload.reasons).toContain('Item was already received');
    });
  });
});
