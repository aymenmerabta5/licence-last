import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string(),

    // AI (Phase 1)
    POE_API_KEY: z.string().min(1),
    POE_MODEL: z.string().min(1).optional(),
    POE_ALLOWED_MODELS: z.string().min(1).optional(),
    POE_BASE_URL: z.string().url().optional(),
    ARCADE_API_KEY: z.string().min(1),

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
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_S3_ENDPOINT: z.url().optional(),
    NEXT_PUBLIC_S3_URL: z.string().url().optional(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    NEXT_PUBLIC_S3_URL: process.env.NEXT_PUBLIC_S3_URL,
  }
});
