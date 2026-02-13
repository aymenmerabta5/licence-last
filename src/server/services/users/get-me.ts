import "server-only"

import { getCompanyByUserId } from "@/server/services/companies/get"
import { getUniversityByUserId } from "@/server/services/universities/get"

/**
 * Get the current user's profile + company/university data.
 * Pure business logic — caller must provide an authenticated user.
 */
export async function getMe(user: {
  id: string
  email: string
  role?: string | null
  name?: string | null
  image?: string | null
  onboardingCompleted?: boolean | null
  twoFactorEnabled?: boolean | null
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

  let universityData = null
  if (user.role === "admin") {
    const uni = await getUniversityByUserId(user.id)
    if (uni) {
      universityData = {
        id: uni.id,
        name: uni.name,
        abbreviation: uni.abbreviation,
        status: uni.status,
        rejectionReason: uni.rejectionReason,
      }
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role ?? "student",
      name: user.name ?? null,
      image: user.image ?? null,
      onboardingCompleted: user.onboardingCompleted ?? false,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
    },
    company: companyData,
    university: universityData,
  }
}

export type MeResult = Awaited<ReturnType<typeof getMe>>
