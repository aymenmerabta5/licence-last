import { headers } from "next/headers"

import {
  convertToModelMessages,
  generateObject,
  stepCountIs,
  streamText,
  tool,
  type ToolSet,
  type UIMessage,
} from "ai"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { asRecord, getStringProp } from "@/lib/ai/tool-output"
import { isRoleAllowedForIntent } from "@/server/services/ai/access"
import { getArcadeTools } from "@/server/services/ai/arcade-tools"
import { assistantContextToJson } from "@/server/services/ai/context"
import { getPoeModel } from "@/server/services/ai/model"
import { checkRateLimit } from "@/server/services/ai/rate-limit"

export const maxDuration = 30

type OfferCopilotIntent =
  | "offer_generate_draft"
  | "offer_improve_description"
  | "offer_suggest_skill_tags"

type CandidateCopilotIntent =
  | "candidate_summarize"
  | "candidate_draft_refusal_note"

type AdminCopilotIntent = "admin_validation_summary"

type StudentCopilotIntent = "student_search_parse" | "student_cover_letter_draft"

type NotificationsCopilotIntent = "notifications_summarize"

type AssistantIntent =
  | OfferCopilotIntent
  | CandidateCopilotIntent
  | AdminCopilotIntent
  | StudentCopilotIntent
  | NotificationsCopilotIntent

const ASSISTANT_INTENTS = new Set<AssistantIntent>([
  "offer_generate_draft",
  "offer_improve_description",
  "offer_suggest_skill_tags",
  "candidate_summarize",
  "candidate_draft_refusal_note",
  "admin_validation_summary",
  "student_search_parse",
  "student_cover_letter_draft",
  "notifications_summarize",
])

function errorToText(error: unknown) {
  if (error == null) return "Unknown error"
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  return JSON.stringify(error)
}

export async function POST(req: Request) {
  let body: { messages: UIMessage[]; context?: unknown }
  try {
    body = (await req.json()) as { messages: UIMessage[]; context?: unknown }
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const contextRecord = asRecord(body.context)
  const intentRaw = getStringProp(contextRecord, "intent")
  const intent: AssistantIntent | null =
    intentRaw && ASSISTANT_INTENTS.has(intentRaw as AssistantIntent)
      ? (intentRaw as AssistantIntent)
      : null

  const role = session.user.role
  const allowedForIntent = isRoleAllowedForIntent({ role, intent })
  if (!allowedForIntent) {
    return new Response("Forbidden", { status: 403 })
  }

  const contextJson = assistantContextToJson(body.context)

  const rl = checkRateLimit({
    key: session.user.id,
    limit: 30,
    windowMs: 60_000,
  })

  if (!rl.ok) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)),
      },
    })
  }

  const internalTools: ToolSet = {
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const prompt = [
          "Convert the user's natural-language internship search query into structured filters.",
          "Only include skillTagIds that exist in the provided availableSkillTags list.",
          "If unsure about a wilaya, omit wilayaCode.",
          "Return only the JSON that matches the schema.",
          `Context JSON:\n${contextJson}`,
        ].join("\n\n")

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
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

        const result = await generateObject({
          model: getPoeModel(),
          schema,
          prompt,
        })

        return result.object
      },
    }),
  }

  const shouldForceTool = intent ? Object.prototype.hasOwnProperty.call(internalTools, intent) : false

  const persona =
    intent === "admin_validation_summary" || role === "admin" || role === "super_admin"
      ? "Internex Admin Copilot"
      : intent?.startsWith("student_") || role === "student"
        ? "Internex Student Copilot"
        : "Internex Company Copilot"

  const system = [
    `You are ${persona}.`,
    "Be concise, practical, and suggest-only. Do not claim to have performed actions you did not perform.",
    "Do not request, infer, or output personal contact information (email, phone) unless explicitly required by the task.",
    body.context ? `Context (redacted):\n${contextJson}` : null,
  ]
    .filter((s): s is string => Boolean(s))
    .join("\n\n")

  const arcadeEnabled = role === "company_admin" && !shouldForceTool && intent === null
  const arcadeTools = arcadeEnabled
    ? await getArcadeTools({
        userId: session.user.id,
        config: {
          allowedToolkits: ["github", "gmail"],
          limit: 20,
        },
      })
    : {}

  const tools: ToolSet = {
    ...internalTools,
    ...arcadeTools,
  }

  console.info("[assistant] request", {
    role,
    intent,
    forcedTool: shouldForceTool,
  })

  const result = streamText({
    model: getPoeModel(),
    system,
    messages: await convertToModelMessages(body.messages),
    tools,
    activeTools: shouldForceTool && intent ? [intent] : undefined,
    toolChoice:
      shouldForceTool && intent ? ({ type: "tool", toolName: intent } as const) : undefined,
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse({
    onError: errorToText,
  })
}
