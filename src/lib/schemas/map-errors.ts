import { z } from "zod"

interface FieldErrors {
  fields: Record<string, string>
}

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError }

/**
 * Maps Zod validation errors to TanStack Form field errors.
 * Returns `undefined` if no errors, enabling direct use in validators.
 *
 * @example
 * validators: {
 *   onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value))
 * }
 */
export function mapZodErrors<T>(
  result: SafeParseResult<T>,
): FieldErrors | undefined {
  if (result.success) return undefined

  const fieldErrors: Record<string, string> = {}

  for (const issue of result.error.issues) {
    const path = issue.path[0]
    if (path !== undefined && !fieldErrors[String(path)]) {
      fieldErrors[String(path)] = issue.message
    }
  }

  return Object.keys(fieldErrors).length > 0 ? { fields: fieldErrors } : undefined
}
