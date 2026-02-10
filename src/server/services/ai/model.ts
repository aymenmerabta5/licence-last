import "server-only"

import { createOpenAI } from "@ai-sdk/openai"

import { env } from "@/env"

const poe = createOpenAI({
  apiKey: env.POE_API_KEY,
  baseURL: env.POE_BASE_URL ?? "https://api.poe.com/v1",
})

const FALLBACK_ALLOWED_MODELS = ["GPT-4o", "GPT-4o-mini"]

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
  const model = isAllowedPoeModelId(requested) ? requested : getDefaultPoeModelId()
  // Poe's OpenAI-compatible API does not reliably support the Responses API
  // for all models. Use Chat Completions for maximum compatibility.
  return poe.chat(model)
}
