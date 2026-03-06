import "server-only"

export interface StudentScopeTarget {
  userId: string
  universityId: string | null
  departmentId: string | null
}

export interface StudentScopeViewer {
  id: string
  role: string | null | undefined
  universityId?: string | null
  departmentId?: string | null
  companyId?: string | null
}

export function canAccessPrivateStudentProfile(
  viewer: StudentScopeViewer,
  target: StudentScopeTarget,
): boolean {
  if (viewer.id === target.userId) {
    return true
  }

  if (viewer.role === "super_admin") {
    return true
  }

  return (
    viewer.role === "university_admin" &&
    viewer.universityId != null &&
    viewer.universityId === target.universityId
  )
}

export function canAccessApplicationTimeline(
  viewer: StudentScopeViewer,
  target: StudentScopeTarget,
  companyId: string,
): boolean {
  if (viewer.id === target.userId) {
    return true
  }

  if (viewer.role === "super_admin") {
    return true
  }

  if (
    viewer.role === "company_admin" &&
    viewer.companyId != null &&
    viewer.companyId === companyId
  ) {
    return true
  }

  if (
    viewer.role === "university_admin" &&
    viewer.universityId != null &&
    viewer.universityId === target.universityId
  ) {
    return true
  }

  return (
    viewer.role === "dept_head" &&
    viewer.universityId != null &&
    viewer.departmentId != null &&
    viewer.universityId === target.universityId &&
    viewer.departmentId === target.departmentId
  )
}