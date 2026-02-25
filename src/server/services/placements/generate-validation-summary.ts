import "server-only"

import { generateText, Output } from "ai"
import { z } from "zod"

import { getAIModel } from "@/server/ai/model"

const validationSummarySchema = z.object({
  summaryBullets: z.array(z.string()),
  checklist: z.array(z.string()),
  potentialInconsistencies: z.array(z.string()),
})

export type ValidationSummary = z.infer<typeof validationSummarySchema>

interface GenerateValidationSummaryInput {
  application: Record<string, unknown>
}

export async function generateValidationSummary(
  input: GenerateValidationSummaryInput,
): Promise<ValidationSummary> {
  const contextJson = JSON.stringify(input.application)

  const prompt = [
    "You are an admin assistant for Stag, an internship platform.",
    "Summarize this placement validation dossier. Provide:",
    "1. summaryBullets: 3-5 bullet points summarizing the application (student, company, offer, dates).",
    "2. checklist: list any missing or incomplete items that the admin should verify before validating (empty array if everything looks complete).",
    "3. potentialInconsistencies: list any red flags or mismatches (empty array if none).",
    "Be concise and factual. Do NOT make validate/reject decisions.",
    `Application data:\n${contextJson}`,
  ].join("\n\n")

  const result = await generateText({
    model: getAIModel(),
    output: Output.object({ schema: validationSummarySchema }),
    prompt,
  })

  return result.output
}
