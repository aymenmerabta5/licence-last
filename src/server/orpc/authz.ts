import "server-only"

export function isAdminRole(
  role: string | null | undefined,
  universityMembershipRole?: string | null,
): boolean {
  return (
    role === "super_admin" ||
    (role === "university_admin" &&
      universityMembershipRole !== "department_head")
  )
}

export function hasUniversityScopedAccess(args: {
  role: string | null | undefined
  universityMembershipRole?: string | null
}): boolean {
  return (
    isAdminRole(args.role, args.universityMembershipRole) ||
    args.universityMembershipRole === "department_head"
  )
}
