import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetSession = mock((): any => Promise.resolve(null))
const mockLocaleRedirect = mock((path: string) => `redirect:${path}`)
const mockHeaders = mock(() => Promise.resolve(new Headers()))
const mockGetCompanyByUserId = mock(async () => null as { status: string } | null)
const mockGetUniversityByUserId = mock(async () => null as { status: string } | null)

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}))

mock.module("next/headers", () => ({
  headers: mockHeaders,
}))

mock.module("@/lib/navigation", () => ({
  localeRedirect: mockLocaleRedirect,
}))

mock.module("@/server/services/companies/get", () => ({
  getCompanyByUserId: mockGetCompanyByUserId,
}))

mock.module("@/server/services/universities/get", () => ({
  getUniversityByUserId: mockGetUniversityByUserId,
}))

describe("requireRole", () => {
  beforeEach(() => {
    mockGetSession.mockClear()
    mockLocaleRedirect.mockClear()
    mockHeaders.mockClear()
    mockGetCompanyByUserId.mockClear()
    mockGetUniversityByUserId.mockClear()

    mockHeaders.mockResolvedValue(new Headers())
    mockGetCompanyByUserId.mockResolvedValue(null)
    mockGetUniversityByUserId.mockResolvedValue(null)
  })

  test("should redirect to /login when no session exists", async () => {
    mockGetSession.mockResolvedValue(null)

    const { requireRole } = await import("./auth-guards")
    await requireRole(["student"])

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/login")
  })

  test("should redirect to / when user role is not in allowed roles", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "student" },
      session: {},
    })

    const { requireRole } = await import("./auth-guards")
    await requireRole(["super_admin"])

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/")
  })

  test("should return the user when role matches", async () => {
    const mockUser = { id: "user-1", role: "super_admin", name: "Admin" }
    mockGetSession.mockResolvedValue({ user: mockUser, session: {} })

    const { requireRole } = await import("./auth-guards")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await requireRole(["super_admin"]) as any

    expect(result.id).toBe("user-1")
    expect(result.role).toBe("super_admin")
  })

  test("should allow any of multiple allowed roles", async () => {
    const mockUser = { id: "user-2", role: "company_admin", name: "Company Admin" }
    mockGetSession.mockResolvedValue({ user: mockUser, session: {} })

    const { requireRole } = await import("./auth-guards")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await requireRole(["company_admin", "super_admin"]) as any

    expect(result.id).toBe("user-2")
    expect(result.role).toBe("company_admin")
  })

  test("should pass headers to getSession", async () => {
    const customHeaders = new Headers({ authorization: "Bearer token" })
    mockHeaders.mockResolvedValue(customHeaders)
    mockGetSession.mockResolvedValue(null)

    const { requireRole } = await import("./auth-guards")
    await requireRole(["student"])

    expect(mockGetSession).toHaveBeenCalledWith({ headers: customHeaders })
  })

  test("should reject dept_head when only university_admin is allowed", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-3", role: "dept_head" },
      session: {},
    })

    const { requireRole } = await import("./auth-guards")
    await requireRole(["university_admin"])

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/")
  })

  test("should redirect pending company_admin to company pending status", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-4", role: "company_admin", onboardingCompleted: true },
      session: {},
    })
    mockGetCompanyByUserId.mockResolvedValue({ status: "pending" })

    const { requireRole } = await import("./auth-guards")
    await requireRole(["company_admin"])

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/status/company/pending")
  })

  test("should redirect pending university_admin to university pending status", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-5", role: "university_admin", onboardingCompleted: true },
      session: {},
    })
    mockGetUniversityByUserId.mockResolvedValue({ status: "pending" })

    const { requireRole } = await import("./auth-guards")
    await requireRole(["university_admin"])

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/status/university/pending")
  })

  test("should allow pending users when allowUnapproved is true", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-6", role: "company_admin", onboardingCompleted: true },
      session: {},
    })
    mockGetCompanyByUserId.mockResolvedValue({ status: "pending" })

    const { requireRole } = await import("./auth-guards")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await requireRole(["company_admin"], { allowUnapproved: true }) as any

    expect(result.id).toBe("user-6")
    expect(result.role).toBe("company_admin")
  })
})
