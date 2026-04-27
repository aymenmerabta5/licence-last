import "server-only"

import { createOpenAI } from "@ai-sdk/openai"

import { env } from "@/env"

/**
 * Some OpenAI-compatible providers (e.g. Poe) omit `choices[].index` in SSE chunks.
 * This fetch wrapper patches each SSE line to add the missing field.
 */
async function sseCompatFetch(
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
    // Not valid JSON - pass through unchanged.
  }
  return line
}

const GENERIC_FALLBACK_ALLOWED_MODELS = ["openai/gpt-4o-mini", "openai/gpt-4o"]
const POE_FALLBACK_ALLOWED_MODELS = ["GPT-5.2", "GPT-4o", "GPT-4o-mini"]

const AI_PROVIDER_CONFIG_ERROR =
  "AI provider is not configured. Set AI_API_KEY and AI_BASE_URL before using AI features."

const baseURL = env.AI_BASE_URL
const isPoeEndpoint = baseURL?.includes("api.poe.com") ?? false

const fallbackAllowedModels = isPoeEndpoint
  ? [...POE_FALLBACK_ALLOWED_MODELS]
  : [...GENERIC_FALLBACK_ALLOWED_MODELS]

const aiProvider = createOpenAI({
  apiKey: env.AI_API_KEY,
  baseURL,
  fetch: isPoeEndpoint ? (sseCompatFetch as typeof globalThis.fetch) : undefined,
})

export function hasAIProviderConfig(): boolean {
  return Boolean(env.AI_API_KEY)
}

function assertAIProviderConfig() {
  if (!hasAIProviderConfig()) {
    throw new Error(AI_PROVIDER_CONFIG_ERROR)
  }
}

export function getDefaultModelId(): string {
  const allowed = getAllowedModelIds()
  const preferred = env.AI_MODEL

  if (preferred && allowed.includes(preferred)) {
    return preferred
  }

  return allowed[0] ?? fallbackAllowedModels[0]
}

export function getAllowedModelIds(): string[] {
  return parseAllowedModels(env.AI_ALLOWED_MODELS, fallbackAllowedModels)
}

export function isAllowedModelId(modelId: string): boolean {
  return getAllowedModelIds().includes(modelId)
}

function parseAllowedModels(
  raw: string | undefined,
  fallback: string[],
): string[] {
  if (!raw) return [...fallback]
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length > 0 ? list : [...fallback]
}

export function getAIModel(modelId?: string) {
  assertAIProviderConfig()
  const requested = modelId ?? getDefaultModelId()
  const model = isAllowedModelId(requested) ? requested : getDefaultModelId()
  return aiProvider.chat(model)
}
