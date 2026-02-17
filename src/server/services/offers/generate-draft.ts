import "server-only"

import { generateObject } from "ai"
import { z } from "zod"

import { getPoeModel } from "@/server/ai/model"

const internshipTypes = ["pfe", "immersion", "summer", "practical"] as const
const workModes = ["on_site", "hybrid", "remote"] as const

const generateDraftSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  internshipType: z.enum(internshipTypes).optional(),
  workMode: z.enum(workModes).nullable().optional(),
  wilayaCode: z.number().int().nullable().optional(),
  durationWeeks: z.number().int().nullable().optional(),
  maxPositions: z.number().int().min(1).optional(),
  applicationDeadlineAt: z.string().nullable().optional(),
  expectedStartDate: z.string().nullable().optional(),
  expectedEndDate: z.string().nullable().optional(),
  suggestedSkillTagIds: z.array(z.string()).optional(),
  suggestedSkillTagNames: z.array(z.string()).optional(),
})

/** Maps common AI-generated labels back to our enum codes */
const internshipTypeMap: Record<string, (typeof internshipTypes)[number]> = {
  pfe: "pfe",
  "final year project": "pfe",
  immersion: "immersion",
  summer: "summer",
  "summer internship": "summer",
  practical: "practical",
  "practical training": "practical",
}
const workModeMap: Record<string, (typeof workModes)[number]> = {
  on_site: "on_site",
  onsite: "on_site",
  "on-site": "on_site",
  "on site": "on_site",
  hybrid: "hybrid",
  remote: "remote",
}

export type GenerateDraftResult = z.infer<typeof generateDraftSchema>

interface GenerateDraftInput {
  prompt?: string
  title?: string
  description?: string
  internshipType?: string
  workMode?: string | null
  wilayaCode?: number | null
  durationWeeks?: number | null
  maxPositions?: number
  applicationDeadlineAt?: string | null
  expectedStartDate?: string | null
  expectedEndDate?: string | null
  availableSkillTags: { id: string; name: string }[]
}

export async function generateOfferDraft(
  input: GenerateDraftInput,
): Promise<GenerateDraftResult> {
  const skillsList =
    input.availableSkillTags.length > 0
      ? input.availableSkillTags.map((s) => `${s.id}:${s.name}`).join(", ")
      : ""

  const contextJson = JSON.stringify({
    prompt: input.prompt,
    currentForm: {
      title: input.title,
      description: input.description,
      internshipType: input.internshipType,
      workMode: input.workMode,
      wilayaCode: input.wilayaCode,
      durationWeeks: input.durationWeeks,
      maxPositions: input.maxPositions,
      applicationDeadlineAt: input.applicationDeadlineAt,
      expectedStartDate: input.expectedStartDate,
      expectedEndDate: input.expectedEndDate,
    },
    availableSkillTags: input.availableSkillTags,
  })

  const prompt = [
    "Generate an internship offer draft for Internex.",
    "Use the user's prompt and current form state as context.",
    "Fill in missing fields and improve existing ones.",
    "IMPORTANT — use these EXACT values for enum fields:",
    '- internshipType: one of "pfe", "immersion", "summer", "practical"',
    '- workMode: one of "on_site", "hybrid", "remote"',
    "- wilayaCode: an integer (e.g. 16, not \"16\")",
    '- applicationDeadlineAt: YYYY-MM-DD format when provided',
    '- expectedStartDate: YYYY-MM-DD format when provided',
    '- expectedEndDate: YYYY-MM-DD format when provided',
    skillsList
      ? `Use skill tags from this list when suggesting: ${skillsList}`
      : "No skill tags available.",
    "Return only the JSON that matches the schema.",
    `Context JSON:\n${contextJson}`,
  ].join("\n\n")

  const result = await generateObject({
    model: getPoeModel(),
    schema: generateDraftSchema,
    prompt,
    experimental_repairText: async ({ text }) => {
      let fixed = text
      // Fix internshipType — replace human-readable label with enum code
      fixed = fixed.replace(
        /"internshipType"\s*:\s*"([^"]+)"/,
        (_m: string, val: string) => {
          const mapped = internshipTypeMap[val.toLowerCase()]
          return `"internshipType": "${mapped ?? "summer"}"`
        },
      )
      // Fix workMode — replace human-readable label with enum code
      fixed = fixed.replace(
        /"workMode"\s*:\s*"([^"]+)"/,
        (_m: string, val: string) => {
          const mapped = workModeMap[val.toLowerCase()]
          return `"workMode": "${mapped ?? "on_site"}"`
        },
      )
      // Fix wilayaCode string → number
      fixed = fixed.replace(
        /"wilayaCode"\s*:\s*"(\d+)"/,
        (_m: string, val: string) => `"wilayaCode": ${Number(val)}`,
      )
      return fixed
    },
  })

  return result.object
}
