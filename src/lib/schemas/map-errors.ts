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
    const fullPath =
      issue.path.length > 0 ? issue.path.map(String).join(".") : undefined
    const rootPath =
      issue.path[0] !== undefined ? String(issue.path[0]) : undefined

    if (fullPath && !fieldErrors[fullPath]) {
      fieldErrors[fullPath] = issue.message
    }

    if (rootPath && !fieldErrors[rootPath]) {
      fieldErrors[rootPath] = issue.message
    }
  }

  return Object.keys(fieldErrors).length > 0
    ? { fields: fieldErrors }
    : undefined
}
