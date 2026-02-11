import "server-only"

import type { ToolSet } from "ai"

/**
 * Detect if the user wants to perform an email action based on their message
 */
export function shouldForceGmailTool(userText: string): boolean {
  const text = userText.toLowerCase()

  // More specific patterns to reduce false positives
  const hasSendIntent = /\b(send|compose|draft|write|email)\b/i.test(text)
  const hasEmailAddress = /@\w+\.\w{2,}/.test(text)

  // Require both intent indicators and an email address
  return hasSendIntent && hasEmailAddress
}

/**
 * Find the best Gmail tool name from available tools
 */
export function resolveGmailToolName(
  arcadeTools: ToolSet,
  wantsEmail: boolean,
): string | null {
  if (!wantsEmail) return null

  const toolNames = Object.keys(arcadeTools)

  // First priority: exact match for Gmail_SendEmail
  if (arcadeTools.Gmail_SendEmail) {
    return "Gmail_SendEmail"
  }

  // Find Gmail tools with email-related names
  const gmailToolCandidates = toolNames.filter((name) => {
    const n = name.toLowerCase()
    const startsWithGmail = n.startsWith("gmail_")
    const hasEmail = n.includes("email")
    const hasSendLike = n.includes("send") || n.includes("draft") || n.includes("compose")
    return startsWithGmail && hasEmail && hasSendLike
  })

  if (gmailToolCandidates.length === 0) return null

  // Rank candidates by relevance
  const ranked = [...gmailToolCandidates].sort((a, b) => {
    const score = (s: string) => {
      const v = s.toLowerCase()
      let n = 0
      if (v.includes("send")) n += 5
      if (v.includes("email")) n += 3
      if (v.includes("compose")) n += 2
      if (v.includes("message")) n += 2
      if (v.includes("draft")) n += 1
      // Prefer more specific but keep stable ordering
      n -= Math.min(v.length, 80) / 100
      return n
    }
    return score(b) - score(a)
  })

  return ranked[0] ?? null
}

/**
 * Get the latest user text from messages
 */
export function getLatestUserText(messages: Array<{ role: string; parts: Array<{ type: string; text?: string }> }>): string {
  const last = [...messages].reverse().find((m) => m.role === "user")
  if (!last) return ""
  return last.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .filter(Boolean)
    .join("")
}
