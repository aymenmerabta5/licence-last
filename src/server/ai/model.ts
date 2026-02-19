import "server-only"

import { createOpenAI } from "@ai-sdk/openai"

import { env } from "@/env"

/**
 * Poe's OpenAI-compatible streaming API omits `choices[].index` in SSE chunks,
 * which @ai-sdk/openai v3 requires. This fetch wrapper patches each SSE line
 * to add the missing field so Zod validation passes.
 */
async function poeFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await globalThis.fetch(input, init)

  if (
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  ) {
    return response
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ""

  const patched = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read()

      if (done) {
        if (buffer) controller.enqueue(encoder.encode(buffer))
        controller.close()
        return
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        controller.enqueue(encoder.encode(patchSSELine(line) + "\n"))
      }
    },
  })

  return new Response(patched, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  })
}

function patchSSELine(line: string): string {
  if (!line.startsWith("data: ") || line === "data: [DONE]") return line

  try {
    const json = JSON.parse(line.slice(6))
    if (Array.isArray(json.choices)) {
      let changed = false
      for (let i = 0; i < json.choices.length; i++) {
        if (json.choices[i].index == null) {
          json.choices[i].index = i
          changed = true
        }
      }
      if (changed) return `data: ${JSON.stringify(json)}`
    }
  } catch {
    // Not valid JSON — pass through unchanged
  }
  return line
}

const poe = createOpenAI({
  apiKey: env.POE_API_KEY,
  baseURL: env.POE_BASE_URL ?? "https://api.poe.com/v1",
  fetch: poeFetch as typeof globalThis.fetch,
})

const FALLBACK_ALLOWED_MODELS = ["GPT-5.2", "GPT-4o", "GPT-4o-mini"]

function parseAllowedModels(raw: string | undefined): string[] {
  if (!raw) return [...FALLBACK_ALLOWED_MODELS]
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length > 0 ? list : [...FALLBACK_ALLOWED_MODELS]
}

export function getDefaultPoeModelId(): string {
  const allowed = getAllowedPoeModelIds()
  const preferred = env.POE_MODEL

  if (preferred && allowed.includes(preferred)) {
    return preferred
  }

  return allowed[0] ?? FALLBACK_ALLOWED_MODELS[0]
}

export function getAllowedPoeModelIds(): string[] {
  return parseAllowedModels(env.POE_ALLOWED_MODELS)
}

export function isAllowedPoeModelId(modelId: string): boolean {
  return getAllowedPoeModelIds().includes(modelId)
}

export function getPoeModel(modelId?: string) {
  const requested = modelId ?? getDefaultPoeModelId()
  const model = isAllowedPoeModelId(requested)
    ? requested
    : getDefaultPoeModelId()
  // Poe's OpenAI-compatible API does not reliably support the Responses API
  // for all models. Use Chat Completions for maximum compatibility.
  return poe.chat(model)
}
