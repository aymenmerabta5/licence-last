import "server-only"

import { headers } from "next/headers"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
  type ToolSet,
} from "ai"

import { auth } from "@/lib/auth"
import { ASSISTANT_RATE_LIMIT } from "@/lib/constants/rate-limits"
import { asRecord, getStringProp } from "@/lib/ai/tool-output"
import { checkAdminApproval } from "@/server/auth/approval-gate"
import { isServiceError } from "@/server/services/errors"
import { getAssistantConversationByIdForCompany } from "@/server/services/assistant/get"
import { appendAssistantMessage } from "@/server/services/assistant/messages"
import { extractTextFromParts } from "@/server/services/assistant/utils"

import { ASSISTANT_INTENTS, type AssistantIntent } from "./types"
import { isRoleAllowedForIntent } from "./access"
import { assistantContextToJson } from "./context"
import { checkRateLimit } from "./rate-limit"
import { getPoeModel } from "./model"
import { sanitizeUIMessagesForModel, errorToText } from "./sanitizer"
import { resolvePersona, buildSystemPrompt } from "./prompts"
import { createInternalTools } from "./tools/internal"
import { getArcadeTools } from "./tools/arcade"
import {
  shouldForceGmailTool,
  resolveGmailToolName,
  getLatestUserText,
} from "./tools/gmail-resolver"
import { resolvePersistence, persistUserMessage } from "./persistence"
import { generateConversationTitle } from "./auto-title"
import { resolveToolAuthContext } from "./auth-context"
import { createDataRetrievalTools } from "./tools/data-retrieval"

// Constants
const MAX_MESSAGES = 100
const MAX_CHARS = 500_000

interface RequestBody {
  messages: UIMessage[]
  context?: unknown
  conversationId?: string
}

export async function handleChatRequest(req: Request): Promise<Response> {
  // Parse and validate request body
  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  // Validate size limits
  if (!Array.isArray(body.messages)) {
    return new Response("Invalid messages format", { status: 400 })
  }

  if (body.messages.length > MAX_MESSAGES) {
    return new Response(`Too many messages. Maximum is ${MAX_MESSAGES}.`, { status: 400 })
  }

  const totalChars = body.messages.reduce((acc, m) => {
    const text = m.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("")
    return acc + text.length
  }, 0)

  if (totalChars > MAX_CHARS) {
    return new Response(`Request too large. Maximum is ${MAX_CHARS} characters.`, { status: 400 })
  }

  // Authenticate
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (session.user.banned) {
    return new Response("Forbidden: account suspended", { status: 403 })
  }

  try {
    const approval = await checkAdminApproval(session.user)
    if (!approval.ok) {
      return new Response("Forbidden", { status: 403 })
    }
  } catch (error) {
    if (isServiceError(error) && error.code === "COMPANY_MEMBERSHIP_CONFLICT") {
      return new Response("Forbidden", { status: 403 })
    }
    throw error
  }

  // Parse intent
  const contextRecord = asRecord(body.context)
  const intentRaw = getStringProp(contextRecord, "intent")
  const intent: AssistantIntent | null =
    intentRaw && ASSISTANT_INTENTS.has(intentRaw as AssistantIntent)
      ? (intentRaw as AssistantIntent)
      : null

  // RBAC check
  const role = session.user.role ?? ""
  const allowedForIntent = isRoleAllowedForIntent({ role, intent })
  if (!allowedForIntent) {
    return new Response("Forbidden", { status: 403 })
  }

  const conversationId =
    typeof body.conversationId === "string" ? body.conversationId : null

  // Resolve persistence
  const persistence = conversationId
    ? await resolvePersistence({
        role,
        intent,
        conversationId,
        userId: session.user.id,
      })
    : null

  if (persistence && !persistence.ok) {
    return new Response(
      persistence.status === 404 ? "Conversation not found" : "Forbidden",
      { status: persistence.status },
    )
  }

  // Persist user message if applicable
  if (persistence?.ok && conversationId && persistence.companyId) {
    const lastUiMessage = body.messages[body.messages.length - 1]
    if (lastUiMessage?.role === "user") {
      await persistUserMessage({
        conversationId,
        companyId: persistence.companyId,
        message: lastUiMessage,
      })

      // Fire-and-forget auto-title generation on first user message
      // Check if this is the first message by getting conversation details
      const companyIdForTitle = persistence.companyId
      if (companyIdForTitle) {
        const conversation = await getAssistantConversationByIdForCompany({
          conversationId,
          companyId: companyIdForTitle,
        })

        // Only auto-title if no title exists yet
        if (conversation && !conversation.title) {
          const userText = extractTextFromParts(lastUiMessage.parts as unknown[])
          if (userText) {
            // Fire and forget - don't await
            generateConversationTitle(userText).then(async (title) => {
              if (title) {
                const { updateAssistantConversationTitle } = await import(
                  "@/server/services/assistant/update"
                )
                await updateAssistantConversationTitle({
                  conversationId,
                  companyId: companyIdForTitle,
                  title,
                })
              }
            }).catch(() => {
              // Silently fail - auto-title is non-critical
            })
          }
        }
      }
    }
  }

  // Context JSON
  const contextJson = assistantContextToJson(body.context)

  // Rate limiting
  const rl = await checkRateLimit({
    key: `assistant:chat:${session.user.id}`,
    limit: ASSISTANT_RATE_LIMIT.maxRequests,
    windowMs: ASSISTANT_RATE_LIMIT.windowMs,
  })

  if (!rl.ok) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)),
      },
    })
  }

  // Resolve auth context for data-retrieval tools
  const toolAuthCtx = await resolveToolAuthContext(session)

  // Build tools
  const internalTools = createInternalTools({ contextJson })
  const dataTools = toolAuthCtx ? createDataRetrievalTools(toolAuthCtx) : {}
  const hasDataTools = Object.keys(dataTools).length > 0
  const shouldForceTool = intent ? Object.prototype.hasOwnProperty.call(internalTools, intent) : false

  // Arcade tools
  const latestUserText = getLatestUserText(body.messages)
  const wantsEmailAction = shouldForceGmailTool(latestUserText)

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

  // Resolve Gmail tool if needed
  const forcedArcadeToolName =
    arcadeEnabled && !shouldForceTool && wantsEmailAction
      ? resolveGmailToolName(arcadeTools, wantsEmailAction)
      : null

  // Build system prompt
  const persona = resolvePersona({ intent, role })
  const system = buildSystemPrompt({
    persona,
    arcadeEnabled,
    contextJson: contextJson || null,
    hasDataTools,
  })

  // Combine tools
  const tools: ToolSet = {
    ...internalTools,
    ...dataTools,
    ...arcadeTools,
  }

  // Convert messages for model
  const modelMessages = await convertToModelMessages(
    sanitizeUIMessagesForModel(body.messages),
    {
      tools,
      ignoreIncompleteToolCalls: true,
    },
  )

  // Create stream
  const stream = createUIMessageStream({
    originalMessages: body.messages,
    onError: errorToText,
    onFinish: async ({ responseMessage }) => {
      if (!persistence?.ok) return

      const companyIdForPersist = persistence.companyId
      if (conversationId && companyIdForPersist) {
        await appendAssistantMessage({
          conversationId,
          companyId: companyIdForPersist,
          role: "assistant",
          parts: responseMessage.parts,
        })
      }
    },
    execute: async ({ writer }) => {
      const result = streamText({
        model: getPoeModel(persistence?.ok && persistence.modelId ? persistence.modelId : undefined),
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
        stopWhen: stepCountIs(arcadeEnabled ? 12 : hasDataTools ? 8 : 5),
      })

      for await (const chunk of result.toUIMessageStream()) {
        writer.write(chunk)
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
