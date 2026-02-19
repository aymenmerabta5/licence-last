import "server-only"

import { generateObject } from "ai"
import { z } from "zod"

import { WILAYAS } from "@/lib/wilayas"
import { getPoeModel } from "@/server/ai/model"

const parseResultSchema = z.object({
  keyword: z.string().optional(),
  wilayaCode: z.number().int().min(1).max(58).nullable().optional(),
  internshipTypes: z
    .array(z.enum(["pfe", "immersion", "summer", "practical"]))
    .default([]),
  workModes: z.array(z.enum(["on_site", "hybrid", "remote"])).default([]),
  skillTagIds: z.array(z.string()).default([]),
  explanation: z.string().optional(),
})

export type ParseSearchResult = z.infer<typeof parseResultSchema>

interface ParseSearchInput {
  query: string
  availableSkillTags: { id: string; name: string }[]
}

export async function parseSearchQuery(
  input: ParseSearchInput,
): Promise<ParseSearchResult> {
  const wilayaCodes = Object.fromEntries(
    WILAYAS.map((name, i) => [name, i + 1]),
  )

  const skillsList =
    input.availableSkillTags.length > 0
      ? input.availableSkillTags.map((s) => `${s.id}:${s.name}`).join(", ")
      : ""

  const contextJson = JSON.stringify({
    query: input.query,
    availableSkillTags: input.availableSkillTags,
    wilayaCodes,
    internshipTypeMapping: {
      pfe: "Projet de Fin d'Études / graduation project / مشروع نهاية الدراسة",
      immersion: "stage d'immersion / exploratory internship / تدريب استكشافي",
      summer: "stage d'été / summer internship / تدريب صيفي",
      practical: "stage pratique / hands-on training / تدريب تطبيقي",
    },
    workModeMapping: {
      on_site: "présentiel / in-office / حضوري",
      hybrid: "hybride / mixed / هجين",
      remote: "à distance / fully remote / عن بعد",
    },
  })

  const prompt = [
    "Convert the user's natural-language internship search query into structured filters.",
    "Extract ALL matching filters from the query in a single response: internshipTypes, workModes, wilayaCode, and skillTagIds.",
    "Use wilayaCodes mapping to resolve city names (in French, Arabic, or English) to numeric codes.",
    "Use workModeMapping to detect work preferences: words like 'remote', 'à distance', 'عن بعد' → [\"remote\"]; 'présentiel', 'on-site', 'حضوري' → [\"on_site\"]; 'hybride', 'hybrid' → [\"hybrid\"].",
    skillsList
      ? `Only include skillTagIds that exist in: ${skillsList}`
      : "No skill tags available.",
    "If unsure about a field, omit it. Return only the JSON that matches the schema.",
    `Context JSON:\n${contextJson}`,
  ].join("\n\n")

  const result = await generateObject({
    model: getPoeModel(),
    schema: parseResultSchema,
    prompt,
  })

  return result.object
}
