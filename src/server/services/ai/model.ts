import "server-only"

import { createOpenAI } from "@ai-sdk/openai"

import { env } from "@/env"

const poe = createOpenAI({
  apiKey: env.POE_API_KEY,
  baseURL: env.POE_BASE_URL ?? "https://api.poe.com/v1",
})

const DEFAULT_POE_MODEL = "GPT-4o"

export function getPoeModel() {
  return poe(env.POE_MODEL ?? DEFAULT_POE_MODEL)
}
