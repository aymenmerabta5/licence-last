import "server-only"

export function isRoleAllowedForIntent({
  role,
  intent,
}: {
  role: string | null | undefined
  intent: string | null
}): boolean {
  if (!role) return false

  const isAdmin = role === "university_admin" || role === "super_admin"
  const isCompanyAdmin = role === "company_admin"
  const isStudent = role === "student"

  if (intent === "admin_validation_summary") return isAdmin
  if (
    intent === "student_search_parse" ||
    intent === "student_cover_letter_draft"
  )
    return isStudent
  if (intent === "notifications_summarize") return true

  // Free-form chat (no intent): company admins + all admin roles
  if (!intent) return isCompanyAdmin || isAdmin

  return isCompanyAdmin
}
