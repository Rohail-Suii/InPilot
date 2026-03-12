import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiter for auth endpoints: 5 attempts per minute per IP
const authLimiter = new RateLimiterMemory({
  keyPrefix: "auth",
  points: 5,
  duration: 60, // per 60 seconds
});

// Rate limiter for general API endpoints: 100 requests per minute per user
const apiLimiter = new RateLimiterMemory({
  keyPrefix: "api",
  points: 100,
  duration: 60,
});

export async function checkAuthRateLimit(ip: string): Promise<{ success: boolean; retryAfter?: number }> {
  try {
    await authLimiter.consume(ip);
    return { success: true };
  } catch (rateLimiterRes) {
    const res = rateLimiterRes as { msBeforeNext: number };
    return {
      success: false,
      retryAfter: Math.ceil(res.msBeforeNext / 1000),
    };
  }
}

export async function checkApiRateLimit(userId: string): Promise<{ success: boolean; retryAfter?: number }> {
  try {
    await apiLimiter.consume(userId);
    return { success: true };
  } catch (rateLimiterRes) {
    const res = rateLimiterRes as { msBeforeNext: number };
    return {
      success: false,
      retryAfter: Math.ceil(res.msBeforeNext / 1000),
    };
  }
}
