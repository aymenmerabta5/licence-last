export const ONE_MINUTE_IN_MS = 60_000

export const ASSISTANT_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: ONE_MINUTE_IN_MS,
} as const
