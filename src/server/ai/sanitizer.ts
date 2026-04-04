import "server-only"

import type { UIMessage } from "ai"

export {
  extractTextFromParts,
  redactSecrets,
  stripProviderMetadata,
} from "@/server/services/assistant/utils"

export function errorToText(error: unknown) {
  void error
  return "The assistant is temporarily unavailable. Please try again."
}

export function sanitizeUIMessagesForModel(
  messages: UIMessage[],
): Array<Omit<UIMessage, "id">> {
  return messages.map((message) => {
    const rest = { ...message }
    delete (rest as { id?: string }).id

    const parts = rest.parts.map((part) => {
      if (part && typeof part === "object") {
        const record = part as Record<string, unknown>

        if ("providerMetadata" in record || "callProviderMetadata" in record) {
          const next = { ...record }
          delete next.providerMetadata
          delete next.callProviderMetadata
          return next as unknown as typeof part
        }
      }
      return part
    })

    return {
      ...rest,
      parts,
    }
  })
}
