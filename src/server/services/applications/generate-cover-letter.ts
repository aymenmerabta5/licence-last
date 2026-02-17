import "server-only"

import { generateObject } from "ai"
import { z } from "zod"

import { getPoeModel } from "@/server/ai/model"

const coverLetterSchema = z.object({
  coverLetter: z.string().min(1),
})

interface GenerateCoverLetterInput {
  offerTitle: string
  offerDescription: string
  internshipType?: string
  workMode?: string | null
  skills: string[]
  companyName: string
  companyDescription?: string | null
  currentCoverLetter?: string | null
}

export async function generateCoverLetter(
  input: GenerateCoverLetterInput,
): Promise<{ coverLetter: string }> {
  const contextJson = JSON.stringify({
    offer: {
      title: input.offerTitle,
      description: input.offerDescription,
      internshipType: input.internshipType,
      workMode: input.workMode,
      skills: input.skills,
    },
    company: {
      name: input.companyName,
      description: input.companyDescription,
    },
    currentCoverLetter: input.currentCoverLetter,
  })

  const prompt = [
    "Write a professional cover letter for a student applying to this internship.",
    "The cover letter should be concise (150-250 words), enthusiastic, and highlight how the student's interest aligns with the role.",
    "Do NOT use placeholder text like [Your Name] — write it generically so the student can personalize it.",
    "If a current cover letter is provided, improve it while keeping the student's intent.",
    "Write in a natural, professional tone. Avoid clichés.",
    "Return only the cover letter text — no subject line, no signature block.",
    `Context:\n${contextJson}`,
  ].join("\n\n")

  const result = await generateObject({
    model: getPoeModel(),
    schema: coverLetterSchema,
    prompt,
    experimental_repairText: async ({ text }) => {
      // Poe's API sometimes returns plain text instead of JSON.
      // If the response isn't valid JSON, wrap it in the expected schema.
      try {
        JSON.parse(text)
        return text
      } catch {
        // Escape the raw text for safe JSON embedding
        const escaped = JSON.stringify(text.trim())
        return `{"coverLetter":${escaped}}`
      }
    },
  })

  return result.object
}
