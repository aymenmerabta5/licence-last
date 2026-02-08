import "server-only"

import { getCompanyByUserId } from "@/server/services/companies/get"

/**
 * Get the current user's profile + company data.
 * Pure business logic — caller must provide an authenticated user.
 */
export async function getMe(user: {
  id: string
  email: string
  role?: string | null
  name?: string | null
  onboardingCompleted?: boolean | null
}) {
  let companyData = null
  if (user.role === "company_admin") {
    const company = await getCompanyByUserId(user.id)
    if (company) {
      companyData = {
        id: company.id,
        name: company.name,
        slug: company.slug,
        status: company.status,
      }
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role ?? "student",
      name: user.name ?? null,
      onboardingCompleted: user.onboardingCompleted ?? false,
    },
    company: companyData,
  }
}

export type MeResult = Awaited<ReturnType<typeof getMe>>
