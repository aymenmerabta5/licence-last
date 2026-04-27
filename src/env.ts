import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const optionalUrl = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined
  }
  return value
}, z.string().url().optional())

const optionalString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined
  }
  return value
}, z.string().min(1).optional())

const hasConfiguredAiProvider = Boolean(process.env.AI_API_KEY)
const assistantEnabledByDefault =
  process.env.ARCADE_API_KEY && hasConfiguredAiProvider ? "true" : "false"

export const env = createEnv({
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "Auth secret must be at least 32 characters"),

    // AI provider configuration (OpenAI-compatible, provider-agnostic)
    AI_API_KEY: optionalString,
    AI_MODEL: optionalString,
    AI_ALLOWED_MODELS: optionalString,
    AI_BASE_URL: optionalUrl,
    ARCADE_API_KEY: optionalString,

    RESEND_API_KEY: optionalString,
    EMAIL_FROM: z.preprocess((value) => {
      if (typeof value === "string" && value.trim() === "") {
        return undefined
      }
      return value
    }, z.string().min(3).optional()),
    S3_BUCKET: optionalString,
    S3_ENDPOINT: optionalUrl,
    S3_ACCESS_KEY_ID: optionalString,
    S3_SECRET_ACCESS_KEY: optionalString,
    S3_REGION: z.string().default("auto"),
    S3_PUBLIC_URL: optionalUrl,
    S3_BUCKET_NAME: optionalString,
    AWS_ACCESS_KEY_ID: optionalString,
    AWS_SECRET_ACCESS_KEY: optionalString,

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
    FEATURE_COMPANY_ASSISTANT: z
      .enum(["true", "false"])
      .default(assistantEnabledByDefault),

    // Logging
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),

    // Cloudflare Turnstile (CAPTCHA)
    TURNSTILE_SECRET_KEY: optionalString,
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_S3_URL: optionalUrl,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
    NEXT_PUBLIC_E2E_DISABLE_CAPTCHA: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES: z
      .enum(["true", "false"])
      .default("true"),
    NEXT_PUBLIC_FEATURE_SAVED_OFFERS: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_FEATURE_INTERVIEWS: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS: z
      .enum(["true", "false"])
      .default("true"),
    NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT: z
      .enum(["true", "false"])
      .default(assistantEnabledByDefault),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
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
    NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT:
      process.env.NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT,
  },
})

const hasProductionEmailConfig = Boolean(env.RESEND_API_KEY && env.EMAIL_FROM)
const hasProductionStorageConfig = Boolean(
  (env.S3_BUCKET ?? env.S3_BUCKET_NAME) &&
    env.S3_ENDPOINT &&
    (env.S3_ACCESS_KEY_ID ?? env.AWS_ACCESS_KEY_ID) &&
    (env.S3_SECRET_ACCESS_KEY ?? env.AWS_SECRET_ACCESS_KEY) &&
    (env.S3_PUBLIC_URL ?? env.NEXT_PUBLIC_S3_URL),
)
const hasProductionAIConfig = Boolean(env.AI_API_KEY)

if (env.NODE_ENV === "production" && !hasProductionEmailConfig) {
  throw new Error(
    "Transactional email is required in production. Set RESEND_API_KEY and EMAIL_FROM before starting the app.",
  )
}

if (env.NODE_ENV === "production" && !hasProductionStorageConfig) {
  throw new Error(
    "S3-compatible object storage is required in production. Set S3_PUBLIC_URL and either the S3_* or AWS_* storage variables before starting the app.",
  )
}

if (env.NODE_ENV === "production" && !hasProductionAIConfig) {
  throw new Error(
    "AI provider credentials are required in production. Set AI_API_KEY before starting the app.",
  )
}

if (
  env.NODE_ENV === "production" &&
  env.FEATURE_COMPANY_ASSISTANT === "true" &&
  !env.ARCADE_API_KEY
) {
  throw new Error(
    "ARCADE_API_KEY is required when the company assistant is enabled in production.",
  )
}
