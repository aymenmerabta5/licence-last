import "server-only"

import { generateObject } from "ai"
import { z } from "zod"

import { getPoeModel } from "@/server/ai/model"

const improveDescriptionSchema = z.object({
  description: z.string().min(1),
})

export type ImproveDescriptionResult = z.infer<typeof improveDescriptionSchema>

interface ImproveDescriptionInput {
  title?: string
  description?: string
  internshipType?: string
  workMode?: string | null
  wilayaCode?: number | null
  durationWeeks?: number | null
  maxPositions?: number
}

export async function improveOfferDescription(
  input: ImproveDescriptionInput,
): Promise<ImproveDescriptionResult> {
  const prompt = [
    "You are an internship offer editor. Your task is to improve ONLY the description text.",
    "Keep it professional, structured, and specific. Avoid fluff.",
    "Preserve the original intent and key requirements.",
    "You MUST return a JSON object with a single key 'description' containing the improved text.",
    "",
    `Title: ${input.title ?? "N/A"}`,
    `Internship type: ${input.internshipType ?? "N/A"}`,
    `Work mode: ${input.workMode ?? "N/A"}`,
    `Duration: ${input.durationWeeks ? `${input.durationWeeks} weeks` : "N/A"}`,
    "",
    `Current description to improve:\n${input.description ?? ""}`,
  ].join("\n")

  const result = await generateObject({
    model: getPoeModel(),
    schema: improveDescriptionSchema,
    prompt,
  })

  return result.object
}
