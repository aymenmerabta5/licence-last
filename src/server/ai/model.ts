import "server-only"

import { createOpenAI } from "@ai-sdk/openai"

import { env } from "@/env"

/**
 * Poe's OpenAI-compatible streaming API can omit `choices[].index` in SSE chunks.
 * This fetch wrapper patches each SSE line to add the missing field.
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
    // Not valid JSON - pass through unchanged.
  }
  return line
}

const DEFAULT_POE_BASE_URL = "https://api.poe.com/v1"
const DEFAULT_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1"

const POE_FALLBACK_ALLOWED_MODELS = ["GPT-5.2", "GPT-4o", "GPT-4o-mini"]
const GATEWAY_FALLBACK_ALLOWED_MODELS = ["openai/gpt-4o-mini", "openai/gpt-4o"]

type AIProvider = "gateway" | "poe"

function resolveProvider(): AIProvider {
  if (env.AI_PROVIDER) return env.AI_PROVIDER

  if (
    env.AI_API_KEY ||
    env.AI_BASE_URL ||
    env.AI_MODEL ||
    env.AI_ALLOWED_MODELS
  ) {
    return "gateway"
  }

  return "poe"
}

function resolveApiKey(provider: AIProvider): string | undefined {
  if (provider === "gateway") {
    return env.AI_API_KEY ?? env.POE_API_KEY
  }

  return env.POE_API_KEY ?? env.AI_API_KEY
}

function resolveBaseURL(provider: AIProvider): string {
  if (provider === "gateway") {
    return env.AI_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL
  }

  return env.POE_BASE_URL ?? DEFAULT_POE_BASE_URL
}

function resolveFallbackAllowedModels(provider: AIProvider): string[] {
  return provider === "gateway"
    ? [...GATEWAY_FALLBACK_ALLOWED_MODELS]
    : [...POE_FALLBACK_ALLOWED_MODELS]
}

function resolveModelRaw(provider: AIProvider): string | undefined {
  if (provider === "gateway") {
    return env.AI_MODEL ?? env.POE_MODEL
  }

  return env.POE_MODEL ?? env.AI_MODEL
}

function resolveAllowedModelsRaw(provider: AIProvider): string | undefined {
  if (provider === "gateway") {
    return env.AI_ALLOWED_MODELS ?? env.POE_ALLOWED_MODELS
  }

  return env.POE_ALLOWED_MODELS ?? env.AI_ALLOWED_MODELS
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

const activeProvider = resolveProvider()
const aiProvider = createOpenAI({
  apiKey: resolveApiKey(activeProvider),
  baseURL: resolveBaseURL(activeProvider),
  fetch:
    activeProvider === "poe"
      ? (poeFetch as typeof globalThis.fetch)
      : undefined,
})

export function getAIProvider(): AIProvider {
  return activeProvider
}

export function getDefaultModelId(): string {
  const allowed = getAllowedModelIds()
  const preferred = resolveModelRaw(activeProvider)

  if (preferred && allowed.includes(preferred)) {
    return preferred
  }

  return allowed[0] ?? resolveFallbackAllowedModels(activeProvider)[0]
}

export function getAllowedModelIds(): string[] {
  return parseAllowedModels(
    resolveAllowedModelsRaw(activeProvider),
    resolveFallbackAllowedModels(activeProvider),
  )
}

export function isAllowedModelId(modelId: string): boolean {
  return getAllowedModelIds().includes(modelId)
}

export function getAIModel(modelId?: string) {
  const requested = modelId ?? getDefaultModelId()
  const model = isAllowedModelId(requested) ? requested : getDefaultModelId()
  return aiProvider.chat(model)
}

// Backward-compatible exports during migration.
export const getDefaultPoeModelId = getDefaultModelId
export const getAllowedPoeModelIds = getAllowedModelIds
export const isAllowedPoeModelId = isAllowedModelId
export const getPoeModel = getAIModel
