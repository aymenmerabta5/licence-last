import { z } from "zod"

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .max(20, "Code is too long")
    .trim()
    .toUpperCase(),
})

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>
