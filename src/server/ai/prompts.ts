import "server-only"

import type { AssistantIntent, AssistantPersona } from "@/server/ai/types"

export function resolvePersona({
  intent,
  role,
}: {
  intent: AssistantIntent | null
  role: string
}): AssistantPersona {
  if (
    intent === "admin_validation_summary" ||
    role === "university_admin" ||
    role === "super_admin"
  ) {
    return "Stag Admin Copilot"
  }
  if (intent?.startsWith("student_") || role === "student") {
    return "Stag Student Copilot"
  }
  return "Stag Company Copilot"
}

export function buildSystemPrompt({
  persona,
  arcadeEnabled,
  contextJson,
  hasDataTools = false,
}: {
  persona: AssistantPersona
  arcadeEnabled: boolean
  contextJson: string | null
  hasDataTools?: boolean
}): string {
  const parts: string[] = [
    `You are ${persona}, an AI assistant for the Stag platform.`,
    "",
    "Stag connects Algerian companies with university students for internships (stages).",
    "Key terms: PFE = Projet de Fin d'Etudes (graduation project internship), wilaya = Algerian province, immersion = exploratory short internship.",
    "",
    "Respond in the same language the user writes in.",
    "Use markdown for formatting. Use code blocks with language tags for code.",
  ]

  if (arcadeEnabled) {
    parts.push(
      "",
      [
        "You can use tools to perform actions for the user (e.g. send an email).",
        "Only perform actions when the user explicitly asks you to.",
        "If an action is unclear or irreversible, ask exactly one short clarification question before using a tool.",
        "If the user asks to send an email and does not specify a subject, use subject 'Hi' by default.",
        "Never pretend you performed an action. Use tools, then report the actual result.",
        "Personal contact info (email/phone) is allowed only when required by the task and explicitly provided by the user.",
      ].join(" "),
    )
  } else {
    parts.push(
      "",
      "Be concise, practical, and suggest-only. Do not claim to have performed actions you did not perform.",
    )
  }

  if (hasDataTools) {
    parts.push(
      "",
      [
        "You have data retrieval tools that fetch real-time information from the platform.",
        "When the user asks about offers, candidates, applications, stats, trust scores, or pending placements, ALWAYS use the appropriate tool instead of guessing.",
        "Present the retrieved data clearly using markdown tables or bullet points.",
        "If a tool returns an error, tell the user something went wrong and suggest they try again.",
      ].join(" "),
    )
  }

  if (contextJson) {
    parts.push(
      "",
      '<context type="application-data" immutable="true">',
      contextJson,
      "</context>",
    )
  }

  return parts.join("\n")
}
