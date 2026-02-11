import "server-only"

import type { UIMessage } from "ai"

export type OfferCopilotIntent =
  | "offer_generate_draft"
  | "offer_improve_description"
  | "offer_suggest_skill_tags"

export type CandidateCopilotIntent =
  | "candidate_summarize"
  | "candidate_draft_refusal_note"

export type AdminCopilotIntent = "admin_validation_summary"

export type StudentCopilotIntent = "student_search_parse" | "student_cover_letter_draft"

export type NotificationsCopilotIntent = "notifications_summarize"

export type AssistantIntent =
  | OfferCopilotIntent
  | CandidateCopilotIntent
  | AdminCopilotIntent
  | StudentCopilotIntent
  | NotificationsCopilotIntent

export const ASSISTANT_INTENTS = new Set<AssistantIntent>([
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

export type AssistantPersona =
  | "Internex Admin Copilot"
  | "Internex Student Copilot"
  | "Internex Company Copilot"

export interface ChatRequest {
  messages: UIMessage[]
  context?: unknown
  conversationId?: string
}

// Role type for RBAC
export type AssistantRole = "student" | "company_admin" | "admin" | "super_admin"

// Rate limit result
export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

// Context data interfaces
export interface MinimizedContext {
  intent: string
  [key: string]: unknown
}

// Persistence result
export interface PersistenceResult {
  ok: boolean
  status: number
  companyId: string | null
  modelId: string | null
}

// Tool-related types
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied"
