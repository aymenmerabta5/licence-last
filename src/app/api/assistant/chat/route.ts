import { headers } from "next/headers"
import { eq } from "drizzle-orm"


import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  generateObject,
  stepCountIs,
  tool,
  type ToolSet,
  type UIMessage,
} from "ai"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { asRecord, getStringProp } from "@/lib/ai/tool-output"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { getAssistantConversationByIdForCompany } from "@/server/services/assistant/get"
import {
  appendAssistantMessage,
  getLatestAssistantMessage,
} from "@/server/services/assistant/messages"
import { extractTextFromParts } from "@/server/services/assistant/utils"
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

function sanitizeUIMessagesForModel(messages: UIMessage[]): Array<Omit<UIMessage, "id">> {
  // Poe's OpenAI-compatible endpoint runs in Zero Data Retention mode for some orgs.
  // In that mode, referencing provider-side item IDs from previous responses can fail.
  // The AI SDK may attach provider metadata to message parts; strip it before sending.
  return messages.map((message) => {
    const rest = { ...message }
    delete (rest as { id?: string }).id

    const parts = rest.parts.map((part) => {
      if (part && typeof part === "object") {
        const record = part as Record<string, unknown>

        // Remove any provider metadata that could include persisted item ids.
        if ("providerMetadata" in record || "callProviderMetadata" in record) {
          const next = { ...record }
          delete next.providerMetadata
          delete next.callProviderMetadata
          return next as unknown as typeof part
        }
      }
      return part
    })

    return {
      ...rest,
      parts,
    }
  })
}

export async function POST(req: Request) {
  let body: { messages: UIMessage[]; context?: unknown; conversationId?: unknown }
  try {
    body = (await req.json()) as {
      messages: UIMessage[]
      context?: unknown
      conversationId?: unknown
    }
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

  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null

  // Persist only for the free-form Company Admin assistant chat.
  const shouldPersist =
    role === "company_admin" && intent === null && conversationId !== null && conversationId.length > 0

  const persistence = shouldPersist
    ? await (async () => {
        const [membership] = await db
          .select({ companyId: companyMember.companyId })
          .from(companyMember)
          .where(eq(companyMember.userId, session.user.id))
          .limit(1)

        if (!membership) {
          return { ok: false as const, status: 403 as const, companyId: null, modelId: null }
        }

        const conversation = await getAssistantConversationByIdForCompany({
          conversationId,
          companyId: membership.companyId,
        })

        if (!conversation) {
          return { ok: false as const, status: 404 as const, companyId: null, modelId: null }
        }

        return {
          ok: true as const,
          status: 200 as const,
          companyId: membership.companyId,
          modelId: conversation.model,
        }
      })()
    : null

  if (persistence && !persistence.ok) {
    return new Response(persistence.status === 404 ? "Conversation not found" : "Forbidden", {
      status: persistence.status,
    })
  }

  if (persistence?.ok) {
    const persistedConversationId = conversationId
    if (persistedConversationId) {
      const lastUiMessage = body.messages[body.messages.length - 1]
      const latestUserMessage = lastUiMessage?.role === "user" ? lastUiMessage : null

      if (latestUserMessage) {
        const lastStored = await getLatestAssistantMessage({
          conversationId: persistedConversationId,
          companyId: persistence.companyId,
        })

        const latestUserText = extractTextFromParts(latestUserMessage.parts as unknown[])
        const shouldAppendUser =
          lastStored?.role !== "user" || (lastStored?.text ?? "") !== latestUserText

        if (shouldAppendUser) {
          await appendAssistantMessage({
            conversationId: persistedConversationId,
            companyId: persistence.companyId,
            role: "user",
            parts: latestUserMessage.parts,
          })
        }
      }
    }
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

  function getLatestUserText(messages: UIMessage[]): string {
    const last = [...messages].reverse().find((m) => m.role === "user")
    if (!last) return ""
    return last.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .filter(Boolean)
      .join("")
  }

  const latestUserText = getLatestUserText(body.messages)
  const wantsEmailAction = /\b(send|email)\b/i.test(latestUserText) && /@/.test(latestUserText)

  const arcadeEnabled = role === "company_admin" && !shouldForceTool && intent === null
  const arcadeTools = arcadeEnabled
    ? await getArcadeTools({
        userId: session.user.id,
        config: {
          allowedToolkits: wantsEmailAction ? ["gmail"] : ["github", "gmail"],
          limit: wantsEmailAction ? 50 : 20,
        },
      })
    : {}

  const persona =
    intent === "admin_validation_summary" || role === "admin" || role === "super_admin"
      ? "Internex Admin Copilot"
      : intent?.startsWith("student_") || role === "student"
        ? "Internex Student Copilot"
        : "Internex Company Copilot"

  const system = [
    `You are ${persona}.`,
    arcadeEnabled
      ? [
          "You can use tools to perform actions for the user (e.g. send an email).",
          "Only perform actions when the user explicitly asks you to.",
          "If an action is unclear or irreversible, ask exactly one short clarification question before using a tool.",
          "If the user asks to send an email and does not specify a subject, use subject 'Hi' by default.",
          "Never pretend you performed an action. Use tools, then report the actual result.",
          "Personal contact info (email/phone) is allowed only when required by the task and explicitly provided by the user.",
        ].join(" ")
      : "Be concise, practical, and suggest-only. Do not claim to have performed actions you did not perform.",
    body.context ? `Context (redacted):\n${contextJson}` : null,
  ]
    .filter((s): s is string => Boolean(s))
    .join("\n\n")

  const tools: ToolSet = {
    ...internalTools,
    ...arcadeTools,
  }

  function pickBestGmailToolName(names: string[]): string | null {
    if (names.length === 0) return null
    const ranked = [...names].sort((a, b) => {
      const score = (s: string) => {
        const v = s.toLowerCase()
        let n = 0
        if (v.includes("send")) n += 5
        if (v.includes("email")) n += 3
        if (v.includes("message")) n += 2
        if (v.includes("draft")) n += 1
        // Prefer more specific (often includes send_email) but keep stable ordering.
        n -= Math.min(v.length, 80) / 100
        return n
      }
      return score(b) - score(a)
    })
    return ranked[0] ?? null
  }

  const gmailToolCandidates = Object.keys(arcadeTools).filter((name) => {
    if (!wantsEmailAction) {
      return /gmail/i.test(name) && /(send|draft|message|email)/i.test(name)
    }

    // Email request: match on semantic name (qualified_name -> underscores).
    const n = name.toLowerCase()
    const startsWithGmail = n.startsWith("gmail_")
    const hasEmail = n.includes("email")
    const hasSendLike = n.includes("send") || n.includes("draft")
    return startsWithGmail && hasEmail && hasSendLike
  })

  const forcedArcadeToolName =
    arcadeEnabled && !shouldForceTool && wantsEmailAction
      ? (arcadeTools.Gmail_SendEmail
          ? "Gmail_SendEmail"
          : pickBestGmailToolName(gmailToolCandidates))
      : null

  console.info("[assistant] request", {
    role,
    intent,
    forcedTool: shouldForceTool,
    arcadeEnabled,
    forcedArcadeToolName,
    arcadeToolsCount: Object.keys(arcadeTools).length,
  })

  const modelMessages = await convertToModelMessages(sanitizeUIMessagesForModel(body.messages), {
    tools,
    ignoreIncompleteToolCalls: true,
  })

  const stream = createUIMessageStream({
    originalMessages: body.messages,
    onError: errorToText,
    onFinish: async ({ responseMessage }) => {
      if (!persistence?.ok) return

      const persistedConversationId = conversationId
      if (!persistedConversationId) return

      await appendAssistantMessage({
        conversationId: persistedConversationId,
        companyId: persistence.companyId,
        role: "assistant",
        parts: responseMessage.parts,
      })
    },
    execute: async ({ writer }) => {
      const result = streamText({
        model: getPoeModel(persistence?.ok ? persistence.modelId : undefined),
        system,
        messages: modelMessages,
        tools,
        activeTools:
          shouldForceTool && intent
            ? [intent]
            : forcedArcadeToolName
              ? [forcedArcadeToolName]
              : undefined,
        toolChoice:
          shouldForceTool && intent
            ? ({ type: "tool", toolName: intent } as const)
            : forcedArcadeToolName
               ? ({ type: "tool", toolName: forcedArcadeToolName } as const)
               : undefined,
        stopWhen: stepCountIs(arcadeEnabled ? 12 : 5),
      })

      for await (const chunk of result.toUIMessageStream()) {
        writer.write(chunk)
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
