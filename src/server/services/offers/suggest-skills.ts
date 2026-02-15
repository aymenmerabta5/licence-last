import "server-only"

import { generateObject } from "ai"
import { z } from "zod"

import { getPoeModel } from "@/server/ai/model"

const suggestSkillsSchema = z.object({
  skillTagIds: z.array(z.string()).default([]),
  skillTagNames: z.array(z.string()).default([]),
})

export type SuggestSkillsResult = z.infer<typeof suggestSkillsSchema>

interface SuggestSkillsInput {
  title?: string
  description?: string
  internshipType?: string
  workMode?: string | null
  availableSkillTags: { id: string; name: string }[]
}

export async function suggestOfferSkills(
  input: SuggestSkillsInput,
): Promise<SuggestSkillsResult> {
  const skillsList =
    input.availableSkillTags.length > 0
      ? input.availableSkillTags.map((s) => `${s.id}:${s.name}`).join(", ")
      : ""

  const contextJson = JSON.stringify({
    currentForm: {
      title: input.title,
      description: input.description,
      internshipType: input.internshipType,
      workMode: input.workMode,
    },
    availableSkillTags: input.availableSkillTags,
  })

  const prompt = [
    "Suggest relevant skill tags for this internship offer.",
    "Prefer returning skillTagIds from the provided available tags.",
    "If you cannot map to an id, return the name in skillTagNames.",
    skillsList
      ? `Available skill tags: ${skillsList}`
      : "No skill tags available.",
    "Return only the JSON that matches the schema.",
    `Context JSON:\n${contextJson}`,
  ].join("\n\n")

  const result = await generateObject({
    model: getPoeModel(),
    schema: suggestSkillsSchema,
    prompt,
  })

  return result.object
}
