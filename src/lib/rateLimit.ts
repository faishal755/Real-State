// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired rate limit keys every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks whether an IP has exceeded the allowed request quota.
 * @param ip Client IP address
 * @param bucket Specific bucket key (e.g. "auth", "appointments", "api")
 * @param maxRequests Maximum requests allowed within window (default: 30)
 * @param windowMs Time window in milliseconds (default: 60 seconds)
 */
export function checkRateLimit(
  ip: string,
  bucket: string = "general",
  maxRequests: number = 30,
  windowMs: number = 60 * 1000
): { isAllowed: boolean; remaining: number; resetTime: number } {
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      isAllowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    // Limit exceeded
    return {
      isAllowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    isAllowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}
