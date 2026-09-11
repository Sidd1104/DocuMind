/**
 * In-Memory Rate Limiter for DocuMind Prototype
 *
 * KNOWN PROTOTYPE LIMITATIONS:
 * 1. Process-local: Stored in server memory (Map). All counts reset whenever the Next.js server restarts.
 * 2. Single-instance only: Does not synchronize across multiple server instances, workers, or serverless functions.
 *    For production infrastructure, replace this with a distributed store like Redis (e.g. Upstash Redis / @upstash/ratelimit).
 */

const stores = new Map();

/**
 * Checks if an action by a key exceeds the maximum allowed attempts in a given sliding time window.
 *
 * @param {string} namespace - e.g. "login", "chat"
 * @param {string} key - identifier (e.g. client IP or userId)
 * @param {number} limit - maximum number of allowed actions within the window
 * @param {number} windowMs - duration of the sliding window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(namespace, key, limit, windowMs) {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  const store = stores.get(namespace);
  const now = Date.now();
  const cutoff = now - windowMs;

  let timestamps = store.get(key) || [];
  // Evict timestamps outside the active sliding window
  timestamps = timestamps.filter((ts) => ts > cutoff);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const resetMs = oldest + windowMs - now;
    return { allowed: false, remaining: 0, resetMs: Math.max(0, resetMs) };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  // Periodic cleanup if store grows large
  if (store.size > 1000) {
    for (const [k, tsList] of store.entries()) {
      const active = tsList.filter((t) => t > cutoff);
      if (active.length === 0) store.delete(k);
      else store.set(k, active);
    }
  }

  return { allowed: true, remaining: limit - timestamps.length, resetMs: windowMs };
}
