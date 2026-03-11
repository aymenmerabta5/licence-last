import "server-only"

interface CompanySummary {
  id: string
  name: string
  slug: string
  status: string
}

interface UniversitySummary {
  id: string
  name: string
  abbreviation: string | null
  status: string
  rejectionReason: string | null
}

interface UserSummary {
  id: string
  email: string
  role: string | null
  name: string | null
  image: string | null
}

interface GetMeDependencies {
  getUserById: (userId: string) => Promise<UserSummary | null>
  getCompanyByUserId: (userId: string) => Promise<CompanySummary | null>
  getUniversityByUserId: (userId: string) => Promise<UniversitySummary | null>
}

const DEFAULT_GET_ME_DEPENDENCIES: GetMeDependencies = {
  getUserById: async (userId) => {
    const { getUserById } = await import("@/server/services/users/get-by-id")
    return getUserById(userId)
  },
  getCompanyByUserId: async (userId) => {
    const { getCompanyByUserId } = await import(
      "@/server/services/companies/get"
    )
    return getCompanyByUserId(userId)
  },
  getUniversityByUserId: async (userId) => {
    const { getUniversityByUserId } = await import(
      "@/server/services/universities/get"
    )
    return getUniversityByUserId(userId)
  },
}

/**
 * Get the current user's profile + company/university data.
 * Pure business logic — caller must provide an authenticated user.
 */
export async function getMe(
  user: {
    id: string
    email: string
    role?: string | null
    name?: string | null
    image?: string | null
    onboardingCompleted?: boolean | null
    twoFactorEnabled?: boolean | null
  },
  dependencies: Partial<GetMeDependencies> = {},
) {
  const resolvedDependencies = {
    ...DEFAULT_GET_ME_DEPENDENCIES,
    ...dependencies,
  }
  const freshUser = await resolvedDependencies.getUserById(user.id)

  let companyData = null
  if (user.role === "company_admin") {
    const company = await resolvedDependencies.getCompanyByUserId(user.id)
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
  if (
    user.role === "student" ||
    user.role === "university_admin" ||
    user.role === "dept_head"
  ) {
    const uni = await resolvedDependencies.getUniversityByUserId(user.id)
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
      email: freshUser ? freshUser.email : user.email,
      role: freshUser
        ? (freshUser.role ?? "student")
        : (user.role ?? "student"),
      name: freshUser ? freshUser.name : (user.name ?? null),
      image: freshUser ? freshUser.image : (user.image ?? null),
      onboardingCompleted: user.onboardingCompleted ?? false,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
    },
    company: companyData,
    university: universityData,
  }
}

export type MeResult = Awaited<ReturnType<typeof getMe>>
