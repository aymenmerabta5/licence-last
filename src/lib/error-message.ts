/**
 * Extracts a human-readable error message from unknown error types.
 * Handles Error instances, API error responses, and string errors.
 *
 * @param err - The caught error of unknown type
 * @param fallback - Default message if extraction fails
 * @returns A displayable error message string
 */
export function getErrorMessage(
  err: unknown,
  fallback = "An error occurred",
): string {
  if (err instanceof Error) return err.message

  if (err && typeof err === "object") {
    if ("message" in err && typeof err.message === "string") {
      return err.message
    }

    if ("error" in err && typeof err.error === "string") {
      return err.error
    }
  }

  if (typeof err === "string") return err

  return fallback
}
