import "server-only"

export type MembershipAwareRoleFilter =
  | "company_admin"
  | "department_head"
  | "recruiter"
  | "university_admin"

interface ResolveRoleFilterParams {
  filterField?: string
  filterValue?: string | number | boolean
  filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
}

export function resolveMembershipAwareRoleFilter(
  params: ResolveRoleFilterParams,
): MembershipAwareRoleFilter | undefined {
  if (
    params.filterField !== "role" ||
    (params.filterOperator && params.filterOperator !== "eq") ||
    typeof params.filterValue !== "string"
  ) {
    return undefined
  }

  if (
    params.filterValue === "company_admin" ||
    params.filterValue === "recruiter" ||
    params.filterValue === "university_admin" ||
    params.filterValue === "department_head"
  ) {
    return params.filterValue
  }

  return undefined
}

export function isPrimaryCompanyAdminRole(args: {
  role: string | null | undefined
  companyMemberRole: string | null | undefined
}) {
  return args.role === "company_admin" && args.companyMemberRole !== "recruiter"
}

export function isPrimaryUniversityAdminRole(args: {
  role: string | null | undefined
  universityMembershipRole: string | null | undefined
}) {
  return (
    args.role === "university_admin" &&
    args.universityMembershipRole !== "department_head"
  )
}