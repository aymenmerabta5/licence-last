import "server-only"

export type AssistantRole = "student" | "company_admin" | "admin" | "super_admin"

export function isRoleAllowedForIntent({
  role,
  intent,
}: {
  role: string | null | undefined
  intent: string | null
}): boolean {
  if (!role) return false

  const isAdmin = role === "admin" || role === "super_admin"
  const isCompanyAdmin = role === "company_admin"
  const isStudent = role === "student"

  if (intent === "admin_validation_summary") return isAdmin
  if (intent === "student_search_parse" || intent === "student_cover_letter_draft") return isStudent
  if (intent === "notifications_summarize") return true

  // Default: company-facing assistants (or no intent)
  return isCompanyAdmin
}
