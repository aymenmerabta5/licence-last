import { z } from "zod"

export type TranslationFn = (key: string) => string

/**
 * Extract a human-readable message from a TanStack Form validation error.
 *
 * Errors originating from Standard Schema validators (Zod v4) are stored as
 * `{ message: string; path?: ... }` objects — not plain strings.
 * This helper normalises both shapes into a displayable string.
 */
export function errorMessage(err: unknown): string {
  if (typeof err === "string") return err
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message)
  }
  return String(err)
}

/**
 * Login form schema — email + password (non-empty)
 */
export function createLoginSchema(t: TranslationFn) {
  return z.object({
    email: z.email({ error: t("emailInvalid") }),
    password: z.string().min(1, { error: t("passwordRequired") }),
  })
}

/**
 * Signup form schema — name, email, password, confirmPassword, agreeToTerms
 *
 * Cross-field validation (password match, terms acceptance) is handled
 * via TanStack Form's `onSubmit` validator, not here.
 */
export function createSignupSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(2, { error: t("nameMin") }),
    email: z.email({ error: t("emailInvalid") }),
    password: z.string().min(8, { error: t("passwordMin") }),
    confirmPassword: z.string().min(1, { error: t("confirmRequired") }),
    agreeToTerms: z.boolean(),
  })
}

/**
 * Reset password schema — email only
 */
export function createResetPasswordSchema(t: TranslationFn) {
  return z.object({
    email: z.email({ error: t("emailInvalid") }),
  })
}

/**
 * Change password schema — currentPassword, newPassword, confirmNewPassword
 *
 * Cross-field validation (password match) is handled via TanStack Form's
 * `onSubmit` validator, same as the signup pattern.
 */
export function createChangePasswordSchema(t: TranslationFn) {
  return z.object({
    currentPassword: z.string().min(1, { error: t("passwordRequired") }),
    newPassword: z.string().min(8, { error: t("passwordMin") }),
    confirmNewPassword: z.string().min(1, { error: t("confirmRequired") }),
  })
}
