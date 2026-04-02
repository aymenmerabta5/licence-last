export type PrimaryUserRole =
  | "student"
  | "company_admin"
  | "university_admin"
  | "super_admin"

export type UniversityMembershipRole = "department_head"

/**
 * Check if a university membership role is "department_head".
 */
export function isDepartmentHead(
  role: string | null | undefined,
): role is UniversityMembershipRole {
  return role === "department_head"
}

/**
 * Resolve primary user role. Legacy `dept_head` DB values map to `university_admin`.
 * This never returns `"dept_head"` — department heads are identified via membership.
 */
export function getEffectiveRole(args: {
  role: string | null | undefined
}): PrimaryUserRole {
  if (
    args.role === "student" ||
    args.role === "company_admin" ||
    args.role === "university_admin" ||
    args.role === "super_admin"
  ) {
    return args.role
  }

  // Legacy dept_head rows in DB get treated as university_admin
  if (args.role === "dept_head") return "university_admin"

  return "student"
}
