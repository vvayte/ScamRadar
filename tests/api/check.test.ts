import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createCompletionMock,
  inspectListingUrlsFromTextMock,
  inspectImageForScamMock,
  consumeRateLimitMock,
  getClientIpMock,
  getCommunityRiskHintsForUrlsMock,
  resolveUsageSubjectMock,
  canRunCheckMock,
  usageSnapshotMock,
  applySuccessfulCheckMock,
  attachAnonymousCookieMock,
} = vi.hoisted(() => ({
  createCompletionMock: vi.fn(),
  inspectListingUrlsFromTextMock: vi.fn(),
  inspectImageForScamMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  getClientIpMock: vi.fn(),
  getCommunityRiskHintsForUrlsMock: vi.fn(),
  resolveUsageSubjectMock: vi.fn(),
  canRunCheckMock: vi.fn(),
  usageSnapshotMock: vi.fn(),
  applySuccessfulCheckMock: vi.fn(),
  attachAnonymousCookieMock: vi.fn(),
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

vi.mock('@/lib/urlInspector', () => ({
  inspectListingUrlsFromText: inspectListingUrlsFromTextMock,
}));

vi.mock('@/lib/imageInspector', () => ({
  inspectImageForScam: inspectImageForScamMock,
}));

vi.mock('@/lib/requestGuard', () => ({
  consumeRateLimit: consumeRateLimitMock,
  getClientIp: getClientIpMock,
}));

vi.mock('@/lib/communityIntel', () => ({
  getCommunityRiskHintsForUrls: getCommunityRiskHintsForUrlsMock,
}));

vi.mock('@/lib/usage', () => ({
  resolveUsageSubject: resolveUsageSubjectMock,
  canRunCheck: canRunCheckMock,
  usageSnapshot: usageSnapshotMock,
  applySuccessfulCheck: applySuccessfulCheckMock,
  attachAnonymousCookie: attachAnonymousCookieMock,
}));

import { POST } from '@/app/api/check/route';

describe('POST /api/check', () => {
  beforeEach(() => {
    createCompletionMock.mockReset();
    inspectListingUrlsFromTextMock.mockReset();
    inspectImageForScamMock.mockReset();
    consumeRateLimitMock.mockReset();
    getClientIpMock.mockReset();
    getCommunityRiskHintsForUrlsMock.mockReset();
    resolveUsageSubjectMock.mockReset();
    canRunCheckMock.mockReset();
    usageSnapshotMock.mockReset();
    applySuccessfulCheckMock.mockReset();
    attachAnonymousCookieMock.mockReset();

    consumeRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 10,
      retryAfterSeconds: 60,
    });
    getClientIpMock.mockReturnValue('127.0.0.1');
    getCommunityRiskHintsForUrlsMock.mockResolvedValue([]);
    resolveUsageSubjectMock.mockResolvedValue({
      kind: 'anonymous',
      anonymous: { key: 'anon_test', premium: false, credits: 0, count: 0 },
      anonymousKey: 'anon_test',
      setAnonymousCookie: false,
    });
    canRunCheckMock.mockReturnValue(true);
    usageSnapshotMock.mockReturnValue({
      authenticated: false,
      premium: false,
      credits: 0,
      count: 2,
      freeLimit: 2,
    });
    applySuccessfulCheckMock.mockResolvedValue({
      authenticated: false,
      premium: false,
      credits: 0,
      count: 1,
      freeLimit: 2,
    });
    attachAnonymousCookieMock.mockImplementation((response) => response);

    inspectListingUrlsFromTextMock.mockResolvedValue({
      urls: [],
      extractedText: '',
      riskHints: [],
      fetchErrors: [],
    });
  });

  it('returns 400 when text is missing', async () => {
    const request = new Request('http://localhost/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'No text provided' });
  });

  it('returns heuristic result without calling OpenAI for obvious scams', async () => {
    const request = new Request('http://localhost/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Urgent limited time prize. Send money by wire transfer on Telegram.',
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.skipAI).toBe(true);
    expect(payload.level).toBe('High');
    expect(payload.usage).toEqual({
      authenticated: false,
      premium: false,
      credits: 0,
      count: 1,
      freeLimit: 2,
    });
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it('returns 402 before analysis when server-side usage is exhausted', async () => {
    canRunCheckMock.mockReturnValueOnce(false);

    const request = new Request('http://localhost/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Please check this suspicious message.',
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(402);
    expect(payload).toEqual({
      error: 'Your free checks are used. Upgrade Shield or buy a one-off check to continue.',
      code: 'PAYWALL_REQUIRED',
      usage: {
        authenticated: false,
        premium: false,
        credits: 0,
        count: 2,
        freeLimit: 2,
      },
    });
    expect(inspectListingUrlsFromTextMock).not.toHaveBeenCalled();
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it('uses URL inspection signals and avoids OpenAI when link context is clearly high risk', async () => {
    inspectListingUrlsFromTextMock.mockResolvedValue({
      urls: ['https://example.com/listing'],
      extractedText:
        '[Source URL] https://example.com/listing\n[Page Title] Urgent transfer only\n[Content Snippet] Send wire transfer now',
      riskHints: [
        'Listing suggests high-risk payment methods',
        'Listing asks to move conversation off-platform',
      ],
      fetchErrors: [],
    });

    const request = new Request('http://localhost/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'https://example.com/listing',
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.skipAI).toBe(true);
    expect(payload.level).toBe('High');
    expect(payload.reasons).toContain('Listing suggests high-risk payment methods');
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it('analyzes uploaded listing image and returns image-driven risk result', async () => {
    inspectImageForScamMock.mockResolvedValue({
      extractedText: 'urgent payment only via bank transfer',
      riskHints: ['Image shows pressure to pay via bank transfer', 'Image suggests urgency'],
      score: 88,
      level: 'High',
      advice: 'Do not pay until the listing is independently verified.',
    });

    const formData = new FormData();
    formData.append('text', '');
    formData.append('image', new Blob(['fake'], { type: 'image/png' }), 'listing.png');

    const request = new Request('http://localhost/api/check', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.level).toBe('High');
    expect(payload.score).toBe(88);
    expect(payload.reasons).toContain('Image shows pressure to pay via bank transfer');
    expect(inspectImageForScamMock).toHaveBeenCalledOnce();
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it('rejects non-image uploads', async () => {
    const formData = new FormData();
    formData.append('text', '');
    formData.append('image', new Blob(['not-image'], { type: 'text/plain' }), 'note.txt');

    const request = new Request('http://localhost/api/check', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Only image files are supported.' });
  });

  it('falls back to OpenAI for uncertain cases and normalizes the payload', async () => {
    createCompletionMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 140,
              level: 'medium risk',
              reasons: ['Suspicious tone', 'Odd request', 'Bad grammar', 'Extra reason'],
              advice: 'Verify the sender before taking action.',
            }),
          },
        },
      ],
    });

    const request = new Request('http://localhost/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Someone I do not know asked me to help with a payment issue.',
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      score: 100,
      level: 'Medium',
      reasons: ['Suspicious tone', 'Odd request', 'Bad grammar'],
      advice: 'Verify the sender before taking action.',
      skipAI: false,
      usage: {
        authenticated: false,
        premium: false,
        credits: 0,
        count: 1,
        freeLimit: 2,
      },
    });
    expect(inspectListingUrlsFromTextMock).toHaveBeenCalledOnce();
    expect(createCompletionMock).toHaveBeenCalledOnce();
  });
});
