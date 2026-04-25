/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Uses a sliding-window counter stored in a module-level Map.
 * Works correctly for a single-instance deployment (Vercel serverless caveat:
 * each lambda is isolated, so this provides per-instance limiting, which is
 * still effective against casual abuse without needing Redis).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitOptions {
  /** Max number of requests in the window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check and increment rate limit for a given key (e.g. IP + route).
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowMs = opts.windowSec * 1000

  let entry = store.get(key)
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs }
    store.set(key, entry)
  }

  entry.count += 1

  return {
    success: entry.count <= opts.limit,
    remaining: Math.max(0, opts.limit - entry.count),
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
