import { z } from "zod"
import type { TranslationFn } from "@/lib/schemas/auth"

export function createVerifyCodeSchema(t: TranslationFn) {
  return z.object({
    code: z
      .string()
      .min(1, { error: t("verifyCodeRequired") })
      .max(20, { error: t("verifyCodeMax") })
      .trim()
      .toUpperCase(),
  })
}

export const verifyCodeSchema = createVerifyCodeSchema((key) => key)

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>
