import "server-only"

import { generateText } from "ai"

import { getAIModel } from "@/server/ai/model"

const TITLE_MODEL_ID = "DeepSeek-V4-Flash-EL"
const MAX_TITLE_LENGTH = 60

/**
 * Generate a conversation title based on the first user message.
 * Called fire-and-forget after persisting the first user message.
 * Uses plain-text generation for maximum provider compatibility.
 */
export async function generateConversationTitle(
  firstUserMessage: string,
): Promise<string> {
  try {
    const prompt = `Generate a short, concise title (maximum ${MAX_TITLE_LENGTH} characters) for a conversation that started with this message:

"""${firstUserMessage.slice(0, 500)}"""

Reply with ONLY the title text — no quotes, no extra explanation.`

    const result = await generateText({
      model: getAIModel(TITLE_MODEL_ID),
      prompt,
    })

    const raw = result.text.trim()
    // Strip surrounding quotes if the model added them
    const cleaned = raw.replace(/^["']+|["']+$/g, "").trim()
    const title = cleaned.slice(0, MAX_TITLE_LENGTH)

    if (title.length > 0) {
      return title
    }
  } catch {
    // Silently fall through to the fallback below
  }

  return `Chat ${new Date().toLocaleDateString()}`
}
