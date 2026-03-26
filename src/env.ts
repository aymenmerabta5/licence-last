import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const optionalUrl = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined
  }

  return value
}, z.string().url().optional())

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "Auth secret must be at least 32 characters"),

    // AI provider routing (gateway-first with Poe compatibility)
    AI_PROVIDER: z.enum(["gateway", "poe"]).optional(),
    AI_API_KEY: z.string().min(1).optional(),
    AI_MODEL: z.string().min(1).optional(),
    AI_ALLOWED_MODELS: z.string().min(1).optional(),
    AI_BASE_URL: z.string().url().optional(),

    // Legacy Poe compatibility (safe fallback during migration)
    POE_API_KEY: z.string().min(1).optional(),
    POE_MODEL: z.string().min(1).optional(),
    POE_ALLOWED_MODELS: z.string().min(1).optional(),
    POE_BASE_URL: z.string().url().optional(),
    ARCADE_API_KEY: z.string().min(1).optional(),

    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(3).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    S3_ENDPOINT: z.url().optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_REGION: z.string().default("auto"),
    S3_PUBLIC_URL: z.url().optional(),
    S3_BUCKET_NAME: z.string().min(1).optional(),
    AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
    AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),

    // Redis (for rate limiting)
    REDIS_URL: optionalUrl,
    REDIS_RATE_LIMIT_ENABLED: z
      .enum(["true", "false"])
      .default(process.env.NODE_ENV === "production" ? "true" : "false"),

    // Server feature flags
    FEATURE_NOTIF_PREFERENCES: z.enum(["true", "false"]).default("true"),
    FEATURE_SAVED_OFFERS: z.enum(["true", "false"]).default("true"),
    FEATURE_INTERVIEWS: z.enum(["true", "false"]).default("true"),
    FEATURE_LANGUAGE_REQUIREMENTS: z.enum(["true", "false"]).default("true"),

    // Logging
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),

    // Cloudflare Turnstile (CAPTCHA)
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_S3_ENDPOINT: z.url().optional(),
    NEXT_PUBLIC_S3_URL: z.string().url().optional(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_E2E_DISABLE_CAPTCHA: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES: z
      .enum(["true", "false"])
      .default("true"),
    NEXT_PUBLIC_FEATURE_SAVED_OFFERS: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_FEATURE_INTERVIEWS: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS: z
      .enum(["true", "false"])
      .default("true"),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    NEXT_PUBLIC_S3_URL: process.env.NEXT_PUBLIC_S3_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_E2E_DISABLE_CAPTCHA:
      process.env.NEXT_PUBLIC_E2E_DISABLE_CAPTCHA,
    NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES:
      process.env.NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES,
    NEXT_PUBLIC_FEATURE_SAVED_OFFERS:
      process.env.NEXT_PUBLIC_FEATURE_SAVED_OFFERS,
    NEXT_PUBLIC_FEATURE_INTERVIEWS: process.env.NEXT_PUBLIC_FEATURE_INTERVIEWS,
    NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS:
      process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS,
  },
})
