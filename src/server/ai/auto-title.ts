import "server-only"

import { generateText, Output } from "ai"
import { z } from "zod"

import { getAIModel } from "@/server/ai/model"

/**
 * Generate a conversation title based on the first user message
 * This is called fire-and-forget after persisting the first user message
 */
export async function generateConversationTitle(
  firstUserMessage: string,
): Promise<string> {
  try {
    const schema = z.object({
      title: z
        .string()
        .max(60)
        .describe("A concise title summarizing the conversation"),
    })

    const prompt = `Generate a short, concise title (max 60 chars) for a conversation that started with this message:

"""${firstUserMessage.slice(0, 500)}"""

The title should capture the main topic or intent of the conversation. Keep it brief and informative.`

    const result = await generateText({
      model: getAIModel(),
      output: Output.object({ schema }),
      prompt,
    })

    return result.output.title
  } catch {
    // Return a fallback title based on timestamp if generation fails
    return `Chat ${new Date().toLocaleDateString()}`
  }
}
