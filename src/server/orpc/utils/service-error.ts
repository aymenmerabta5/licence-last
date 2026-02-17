import { ORPCError } from "@orpc/server"

import { isServiceError } from "@/server/services/errors"

type ORPCStatusCode = ConstructorParameters<typeof ORPCError>[0]

export function createServiceORPCError(
  error: unknown,
  {
    codeMap,
    fallbackMessage,
    fallbackCode = "BAD_REQUEST",
  }: {
    codeMap: Record<string, ORPCStatusCode>
    fallbackMessage: string
    fallbackCode?: ORPCStatusCode
  },
): never {
  if (error instanceof ORPCError) {
    throw error
  }

  if (isServiceError(error)) {
    throw new ORPCError(codeMap[error.code] ?? fallbackCode, {
      message: error.message,
      data: { code: error.code },
      cause: error,
    })
  }

  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    message: fallbackMessage,
    cause: error,
  })
}
