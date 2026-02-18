import "server-only"

export interface ApprovalGateUser {
  id: string
  role?: string | null
  onboardingCompleted?: boolean | null
}

export interface ApprovalGateDependencies {
  getCompanyStatusByUserId: (userId: string) => Promise<{ status: string } | null>
  getUniversityStatusByUserId: (userId: string) => Promise<{ status: string } | null>
}

export type ApprovalDeniedReason =
  | "company_pending"
  | "company_rejected"
  | "company_suspended"
  | "university_pending"
  | "university_rejected"

export type ApprovalCheckResult =
  | { ok: true }
  | { ok: false; reason: ApprovalDeniedReason }

const DEFAULT_APPROVAL_GATE_DEPENDENCIES: ApprovalGateDependencies = {
  getCompanyStatusByUserId: async (userId) => {
    const { getCompanyStatusByUserId } = await import("@/server/services/companies/get-status")
    return getCompanyStatusByUserId(userId)
  },
  getUniversityStatusByUserId: async (userId) => {
    const { getUniversityStatusByUserId } = await import("@/server/services/universities/get-status")
    return getUniversityStatusByUserId(userId)
  },
}

/**
 * Approval checks apply only after onboarding is complete.
 * Before onboarding completion, role-specific approval is intentionally skipped.
 */
export async function checkAdminApproval(
  user: ApprovalGateUser,
  dependencies: Partial<ApprovalGateDependencies> = {},
): Promise<ApprovalCheckResult> {
  if (!user.onboardingCompleted) {
    return { ok: true }
  }

  const resolvedDependencies = {
    ...DEFAULT_APPROVAL_GATE_DEPENDENCIES,
    ...dependencies,
  }

  if (user.role === "company_admin") {
    const company = await resolvedDependencies.getCompanyStatusByUserId(user.id)

    if (!company) {
      return { ok: false, reason: "company_pending" }
    }

    if (company.status === "approved") {
      return { ok: true }
    }

    if (company.status === "rejected") {
      return { ok: false, reason: "company_rejected" }
    }

    if (company.status === "suspended") {
      return { ok: false, reason: "company_suspended" }
    }

    return { ok: false, reason: "company_pending" }
  }

  if (user.role === "university_admin") {
    const university = await resolvedDependencies.getUniversityStatusByUserId(user.id)

    if (!university) {
      return { ok: false, reason: "university_pending" }
    }

    if (university.status === "approved") {
      return { ok: true }
    }

    if (university.status === "rejected") {
      return { ok: false, reason: "university_rejected" }
    }

    return { ok: false, reason: "university_pending" }
  }

  return { ok: true }
}

export function approvalDeniedReasonToRedirectPath(reason: ApprovalDeniedReason): string {
  switch (reason) {
    case "company_rejected":
      return "/status/company/rejected"
    case "company_suspended":
      return "/status/company/suspended"
    case "company_pending":
      return "/status/company/pending"
    case "university_rejected":
      return "/status/university/rejected"
    case "university_pending":
      return "/status/university/pending"
  }
}
