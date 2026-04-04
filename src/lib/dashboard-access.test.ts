import { beforeEach, describe, expect, mock, test } from "bun:test"

interface MockDashboardUser {
  id: string
  email: string
  role: string
  effectiveRole: string
  name: string
  onboardingCompleted: boolean
  universityMembershipRole: string | null
  universityDepartmentId: string | null
}

const requireRoleMock = mock(async (): Promise<MockDashboardUser> => ({
  id: "user-1",
  email: "admin@uni.test",
  role: "university_admin",
  effectiveRole: "university_admin",
  name: "Admin",
  onboardingCompleted: true,
  universityMembershipRole: null,
  universityDepartmentId: null,
}))

const localeRedirectMock = mock(async (path: string) => `redirect:${path}` as never)

mock.module("@/lib/auth-guards", () => ({
  requireRole: requireRoleMock,
}))

mock.module("@/lib/navigation", () => ({
  localeRedirect: localeRedirectMock,
}))

mock.module("@/server/services/companies/get", () => ({
  getCompanyByUserId: mock(async () => null),
}))

mock.module("@/server/services/companies/membership", () => ({
  getCompanyMembership: mock(async () => null),
}))

describe("src/lib/dashboard-access", () => {
  beforeEach(() => {
    requireRoleMock.mockClear()
    localeRedirectMock.mockClear()
    requireRoleMock.mockResolvedValue({
      id: "user-1",
      email: "admin@uni.test",
      role: "university_admin",
      effectiveRole: "university_admin",
      name: "Admin",
      onboardingCompleted: true,
      universityMembershipRole: null,
      universityDepartmentId: null,
    })
  })

  test("requireApprovedUniversityAdmin redirects department heads away from admin-only pages", async () => {
    requireRoleMock.mockResolvedValueOnce({
      id: "head-1",
      email: "head@uni.test",
      role: "university_admin",
      effectiveRole: "university_admin",
      name: "Dept Head",
      onboardingCompleted: true,
      universityMembershipRole: "department_head",
      universityDepartmentId: "dep-1",
    })

    const mod = await import(`@/lib/dashboard-access?test=${Date.now()}`)

    const result = await mod.requireApprovedUniversityAdmin()

    expect(result).toBe("redirect:/dashboard")
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
  })

  test("requireApprovedUniversityAdmin keeps full university admins on admin pages", async () => {
    const mod = await import(`@/lib/dashboard-access?test=${Date.now()}`)

    const result = await mod.requireApprovedUniversityAdmin()

    expect(result).toMatchObject({
      user: {
        id: "user-1",
        role: "university_admin",
      },
    })
    expect(localeRedirectMock).not.toHaveBeenCalled()
  })

  test("requirePlacementValidationAdmin redirects super admins away from university-only validation pages", async () => {
    requireRoleMock.mockResolvedValueOnce({
      id: "super-1",
      email: "super@stag.test",
      role: "super_admin",
      effectiveRole: "super_admin",
      name: "Super Admin",
      onboardingCompleted: true,
      universityMembershipRole: null,
      universityDepartmentId: null,
    })

    const mod = await import(`@/lib/dashboard-access?test=${Date.now()}`)

    const result = await mod.requirePlacementValidationAdmin()

    expect(result).toBe("redirect:/dashboard")
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
  })
})
