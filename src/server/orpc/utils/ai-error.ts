import { ORPCError } from "@orpc/server"

const AI_RATE_LIMIT_MESSAGE =
  "AI service is temporarily rate limited. Please try again shortly."
const AI_UNAVAILABLE_MESSAGE =
  "AI service is temporarily unavailable. Please try again shortly."
const AI_INVALID_REQUEST_MESSAGE =
  "AI request could not be completed. Please review your input and try again."

function getErrorStatusCode(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null
  }

  const statusCode = Reflect.get(error, "statusCode")
  if (typeof statusCode === "number" && Number.isFinite(statusCode)) {
    return statusCode
  }

  const status = Reflect.get(error, "status")
  if (typeof status === "number" && Number.isFinite(status)) {
    return status
  }

  return null
}

export function throwAIOrpcError(error: unknown): never {
  if (error instanceof ORPCError) {
    throw error
  }

  const statusCode = getErrorStatusCode(error)

  if (statusCode === 429) {
    throw new ORPCError("TOO_MANY_REQUESTS", {
      message: AI_RATE_LIMIT_MESSAGE,
      cause: error,
    })
  }

  if (statusCode != null && statusCode >= 400 && statusCode < 500) {
    throw new ORPCError("BAD_REQUEST", {
      message: AI_INVALID_REQUEST_MESSAGE,
      cause: error,
    })
  }

  throw new ORPCError("SERVICE_UNAVAILABLE", {
    message: AI_UNAVAILABLE_MESSAGE,
    cause: error,
  })
}
