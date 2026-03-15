export type PrimaryUserRole =
  | "student"
  | "company_admin"
  | "university_admin"
  | "super_admin"

export type UniversityMembershipRole = "department_head"

export type EffectiveUserRole = PrimaryUserRole | "dept_head"

export function isDepartmentHeadMembershipRole(
  role: string | null | undefined,
): role is UniversityMembershipRole {
  return role === "department_head"
}

export function deriveEffectiveUserRole(args: {
  userRole: string | null | undefined
  universityMembershipRole?: string | null
}): EffectiveUserRole | null {
  if (
    args.userRole === "university_admin" &&
    isDepartmentHeadMembershipRole(args.universityMembershipRole)
  ) {
    return "dept_head"
  }

  if (args.userRole === "dept_head") {
    return "dept_head"
  }

  if (
    args.userRole === "student" ||
    args.userRole === "company_admin" ||
    args.userRole === "university_admin" ||
    args.userRole === "super_admin"
  ) {
    return args.userRole
  }

  return null
}

export type AuthRole = PrimaryUserRole | "dept_head"
export type EffectiveRole = EffectiveUserRole

export function getEffectiveRole(args: {
  role: string | null | undefined
  universityMembershipRole?: string | null
}): EffectiveRole {
  return (
    deriveEffectiveUserRole({
      userRole: args.role,
      universityMembershipRole: args.universityMembershipRole,
    }) ?? "student"
  )
}

export function isTrueUniversityAdmin(
  role: string | null | undefined,
  universityMembershipRole: string | null | undefined,
): boolean {
  return (
    role === "university_admin" &&
    !isDepartmentHeadMembershipRole(universityMembershipRole)
  )
}
