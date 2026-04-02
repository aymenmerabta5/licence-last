import "server-only"

import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { getCompanyMembership } from "@/server/services/companies/membership"

type AuthRole =
  | "student"
  | "company_admin"
  | "university_admin"
  | "super_admin"

interface DashboardUser {
  id: string
  email: string
  role: AuthRole
  effectiveRole: AuthRole
  universityMembershipRole?: "department_head" | null
  universityDepartmentId?: string | null
  name: string | null
  onboardingCompleted?: boolean | null
  [key: string]: unknown
}

type ApprovedCompany = NonNullable<Awaited<ReturnType<typeof getCompanyByUserId>>>
type CompanyMembership = NonNullable<
  Awaited<ReturnType<typeof getCompanyMembership>>
>

export interface OnboardedStudentContext {
  user: DashboardUser & { role: "student"; effectiveRole: "student" }
}

export interface ApprovedCompanyContext {
  user: DashboardUser & { role: "company_admin"; effectiveRole: "company_admin" }
  company: ApprovedCompany
}

export interface CompanyOwnerContext extends ApprovedCompanyContext {
  membership: CompanyMembership
}

export async function requireDashboardUser() {
  return (await requireRole([
    "student",
    "company_admin",
    "university_admin",
    "super_admin",
  ])) as DashboardUser
}

export async function requireOnboardedStudent(): Promise<OnboardedStudentContext> {
  const user = (await requireRole(["student"])) as DashboardUser & {
    role: "student"
    effectiveRole: "student"
  }

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return { user }
}

export async function requireApprovedCompanyAdmin(): Promise<ApprovedCompanyContext> {
  const user = (await requireRole(["company_admin"])) as DashboardUser & {
    role: "company_admin"
    effectiveRole: "company_admin"
  }

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/company")
  }

  const company = await getCompanyByUserId(user.id)

  if (!company) {
    return localeRedirect("/onboarding/company")
  }

  if (company.status !== "approved") {
    if (company.status === "rejected") {
      return localeRedirect("/status/company/rejected")
    }

    if (company.status === "suspended") {
      return localeRedirect("/status/company/suspended")
    }

    return localeRedirect("/status/company/pending")
  }

  return { user, company }
}

export async function requireCompanyOwner(): Promise<CompanyOwnerContext> {
  const { user, company } = await requireApprovedCompanyAdmin()
  const membership = await getCompanyMembership(user.id)

  if (!membership || membership.role !== "owner") {
    return localeRedirect("/dashboard")
  }

  return {
    user,
    company,
    membership,
  }
}

export interface DepartmentHeadContext {
  user: DashboardUser & {
    role: "university_admin"
    effectiveRole: "university_admin"
    universityMembershipRole: "department_head"
    universityDepartmentId: string
  }
}

export async function requireDepartmentHead(): Promise<DepartmentHeadContext> {
  const user = (await requireRole(["university_admin"])) as DashboardUser & {
    role: "university_admin"
    effectiveRole: "university_admin"
  }

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/university")
  }

  if (user.universityMembershipRole !== "department_head") {
    return localeRedirect("/dashboard")
  }

  if (!user.universityDepartmentId) {
    return localeRedirect("/dashboard")
  }

  return {
    user: user as DepartmentHeadContext["user"],
  }
}

export async function requireApprovedUniversityAdmin() {
  const user = (await requireRole([
    "university_admin",
    "super_admin",
  ])) as DashboardUser & {
    role: "university_admin" | "super_admin"
    effectiveRole: "university_admin" | "super_admin"
  }

  if (user.role === "university_admin" && !user.onboardingCompleted) {
    return localeRedirect("/onboarding/university")
  }

  return { user }
}
