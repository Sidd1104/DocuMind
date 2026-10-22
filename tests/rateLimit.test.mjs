import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../lib/rateLimit.js";

describe("In-Memory Sliding Window Rate Limiter", () => {
  test("allows requests under the limit", () => {
    const key = "test-user-1";
    const res1 = checkRateLimit("test-ns", key, 3, 1000);
    assert.equal(res1.allowed, true);
    assert.equal(res1.remaining, 2);

    const res2 = checkRateLimit("test-ns", key, 3, 1000);
    assert.equal(res2.allowed, true);
    assert.equal(res2.remaining, 1);

    const res3 = checkRateLimit("test-ns", key, 3, 1000);
    assert.equal(res3.allowed, true);
    assert.equal(res3.remaining, 0);
  });

  test("blocks requests exceeding the limit within the sliding window", () => {
    const key = "test-user-blocked";
    // 2 allowed per 5000ms
    checkRateLimit("test-block", key, 2, 5000);
    checkRateLimit("test-block", key, 2, 5000);

    const blocked = checkRateLimit("test-block", key, 2, 5000);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.resetMs > 0 && blocked.resetMs <= 5000);
  });

  test("isolates rate limits by namespace", () => {
    const key = "shared-ip";
    // Exceed in 'login' namespace
    checkRateLimit("login-ns", key, 1, 5000);
    const loginBlocked = checkRateLimit("login-ns", key, 1, 5000);
    assert.equal(loginBlocked.allowed, false);

    // Should still be allowed in 'signup' namespace
    const signupAllowed = checkRateLimit("signup-ns", key, 1, 5000);
    assert.equal(signupAllowed.allowed, true);
  });
});
