import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Redis.fromEnv() auto-detects KV_REST_API_URL + KV_REST_API_TOKEN
// (set by Vercel Marketplace) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
export const redis = Redis.fromEnv();

/**
 * Rate limiter: 20 uploads per IP per 10 minutes.
 * Used by the upload handler to prevent abuse.
 */
export const uploadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  analytics: true,
  prefix: "ratelimit:upload",
});

/**
 * Rate limiter: 60 requests per IP per minute.
 * General API rate limit.
 */
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});
