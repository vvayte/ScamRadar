import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetRateLimitStoreForTests,
  consumeRateLimit,
  getClientIp,
} from "@/lib/requestGuard";

describe("requestGuard", () => {
  beforeEach(() => {
    __resetRateLimitStoreForTests();
  });

  it("blocks requests when rate budget is exhausted", () => {
    let lastDecision = consumeRateLimit("1.2.3.4", 1);
    for (let i = 0; i < 30; i += 1) {
      lastDecision = consumeRateLimit("1.2.3.4", 1);
      if (!lastDecision.allowed) break;
    }

    expect(lastDecision.allowed).toBe(false);
    expect(lastDecision.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("accounts for higher-cost requests (e.g. image uploads)", () => {
    const heavy = consumeRateLimit("5.6.7.8", 4);
    const secondHeavy = consumeRateLimit("5.6.7.8", 10);
    const thirdHeavy = consumeRateLimit("5.6.7.8", 10);
    const fourthHeavy = consumeRateLimit("5.6.7.8", 1);
    expect(heavy.allowed).toBe(true);
    expect(secondHeavy.allowed).toBe(true);
    expect(thirdHeavy.allowed).toBe(true);
    expect(fourthHeavy.allowed).toBe(false);
  });

  it("extracts client IP from proxy headers", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 70.41.3.18",
      "x-real-ip": "203.0.113.11",
    });

    expect(getClientIp(headers)).toBe("203.0.113.10");
  });
});
