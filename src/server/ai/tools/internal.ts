import "server-only"

import { generateObject, tool, type ToolSet } from "ai"
import { z } from "zod"

import { WILAYAS } from "@/lib/wilayas"
import { getPoeModel } from "../model"

interface CreateInternalToolsParams {
  contextJson: string
}

async function safeGenerateObject<T>({
  schema,
  prompt,
  system,
}: {
  schema: z.ZodType<T>
  prompt: string
  system?: string
}): Promise<T | { error: string; detail: string }> {
  try {
    const result = await generateObject({
      model: getPoeModel(),
      schema,
      prompt,
      ...(system && { system }),
    })
    return result.object as T
  } catch (e) {
    return {
      error: "Failed to generate.",
      detail: e instanceof Error ? e.message : "unknown",
    }
  }
}

export function createInternalTools({ contextJson }: CreateInternalToolsParams): ToolSet {
  return {
    offer_generate_draft: tool({
      description: "Generate a structured internship offer draft from the current form context.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          internshipType: z.enum(["pfe", "immersion", "summer", "practical"]).optional(),
          workMode: z.enum(["on_site", "hybrid", "remote"]).nullable().optional(),
          wilayaCode: z.number().int().nullable().optional(),
          durationWeeks: z.number().int().nullable().optional(),
          maxPositions: z.number().int().min(1).optional(),
          suggestedSkillTagIds: z.array(z.string()).optional(),
          suggestedSkillTagNames: z.array(z.string()).optional(),
        })

        const prompt = [
          "Generate an internship offer draft for Internex.",
          "Return only the JSON that matches the schema.",
          "Use the provided available skill tags when suggesting skillTagIds.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    offer_improve_description: tool({
      description: "Rewrite the current offer description to be clearer, more concise, and inclusive.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          description: z.string().min(1),
        })

        const prompt = [
          "Improve the offer description for clarity, structure, and tone.",
          "Keep it professional and specific. Avoid fluff.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    offer_suggest_skill_tags: tool({
      description: "Suggest relevant skill tags based on the offer description and available tags.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          skillTagIds: z.array(z.string()).default([]),
          skillTagNames: z.array(z.string()).default([]),
        })

        const prompt = [
          "Suggest relevant skill tags.",
          "Prefer returning skillTagIds from the provided available tags.",
          "If you cannot map to an id, return the name in skillTagNames.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    candidate_summarize: tool({
      description:
        "Summarize a candidate application in a short, neutral way. Do not rank or recommend accept/refuse.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          summary: z.string().min(1),
          strengths: z.array(z.string()).default([]),
          concerns: z.array(z.string()).default([]),
          followUps: z.array(z.string()).default([]),
        })

        const prompt = [
          "Summarize this candidate application for a recruiter.",
          "Be neutral and factual. Do not rank candidates and do not recommend accept/refuse decisions.",
          "Avoid sensitive or protected-class inferences.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    candidate_draft_refusal_note: tool({
      description:
        "Draft a short, professional refusal note for a candidate. Avoid sensitive language.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          note: z.string().min(1),
        })

        const prompt = [
          "Draft a refusal note for this candidate.",
          "Keep it short, professional, and kind.",
          "Do not mention protected characteristics or sensitive assumptions.",
          "Do not promise future contact or feedback unless explicitly asked in the context.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    admin_validation_summary: tool({
      description:
        "Summarize a placement validation case and produce a checklist of missing info/inconsistencies.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          summaryBullets: z.array(z.string()).min(1),
          checklist: z.array(z.string()).default([]),
          potentialInconsistencies: z.array(z.string()).default([]),
        })

        const prompt = [
          "You are assisting an admin reviewing a placement validation case.",
          "Summarize the case and identify missing info and potential inconsistencies.",
          "Do not decide validate/reject.",
          "Avoid sensitive inferences.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    student_search_parse: tool({
      description:
        "Parse a free-text internship search query into filters (internshipTypes, workModes, wilayaCode, skillTagIds).",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          keyword: z.string().optional(),
          wilayaCode: z.number().int().min(1).max(58).nullable().optional(),
          internshipTypes: z.array(z.enum(["pfe", "immersion", "summer", "practical"])).default([]),
          workModes: z.array(z.enum(["on_site", "hybrid", "remote"])).default([]),
          skillTagIds: z.array(z.string()).default([]),
          explanation: z.string().optional(),
        })

        // Enrich the original context JSON with reference data
        let enrichedContext: Record<string, unknown> = {}
        try {
          enrichedContext = JSON.parse(contextJson) as Record<string, unknown>
        } catch {
          enrichedContext = { query: contextJson }
        }

        // Inject reference mappings into context
        enrichedContext.wilayaCodes = Object.fromEntries(
          WILAYAS.map((name, i) => [name, i + 1]),
        )
        enrichedContext.internshipTypeMapping = {
          pfe: "Projet de Fin d'Études / graduation project / مشروع نهاية الدراسة",
          immersion: "stage d'immersion / exploratory internship / تدريب استكشافي",
          summer: "stage d'été / summer internship / تدريب صيفي",
          practical: "stage pratique / hands-on training / تدريب تطبيقي",
        }
        enrichedContext.workModeMapping = {
          on_site: "présentiel / in-office / حضوري",
          hybrid: "hybride / mixed / هجين",
          remote: "à distance / fully remote / عن بعد",
        }

        const prompt = [
          "Convert the user's natural-language internship search query into structured filters.",
          "Extract ALL matching filters from the query in a single response: internshipTypes, workModes, wilayaCode, and skillTagIds.",
          "Use wilayaCodes mapping to resolve city names (in French, Arabic, or English) to numeric codes.",
          "Use workModeMapping to detect work preferences: words like 'remote', 'à distance', 'عن بعد' → [\"remote\"]; 'présentiel', 'on-site', 'حضوري' → [\"on_site\"]; 'hybride', 'hybrid' → [\"hybrid\"].",
          "Only include skillTagIds that exist in the provided availableSkillTags list.",
          "If unsure about a field, omit it. Return only the JSON that matches the schema.",
          `Context JSON:\n${JSON.stringify(enrichedContext)}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    student_cover_letter_draft: tool({
      description:
        "Draft or refine a student cover letter for a specific internship offer. Suggest-only; never submit.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          coverLetter: z.string().min(1),
        })

        const prompt = [
          "Draft a concise, professional cover letter for the student.",
          "Use the offer and company context. Avoid sensitive assumptions.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),

    notifications_summarize: tool({
      description:
        "Summarize a user's notification feed and suggest safe next actions, considering the user's role.",
      inputSchema: z.object({}),
      execute: async () => {
        const schema = z.object({
          summaryBullets: z.array(z.string()).min(1),
          suggestedNextActions: z.array(z.string()).default([]),
        })

        const prompt = [
          "Summarize the notification feed and suggest next actions.",
          "Be role-aware and keep it safe. Do not take actions automatically.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        return safeGenerateObject({ schema, prompt })
      },
    }),
  }
}
