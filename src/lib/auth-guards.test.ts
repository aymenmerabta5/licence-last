import { beforeEach, describe, expect, mock, test } from "bun:test"

import { requireRole } from "./auth-guards"

interface SessionUser {
  id: string
  role: string
  name: string | null
  email: string
  onboardingCompleted?: boolean
  [key: string]: unknown
}

type SessionResult = {
  user: SessionUser
  session: Record<string, unknown>
} | null

const mockGetSession = mock<(input: { headers: Headers }) => Promise<SessionResult>>(
  () => Promise.resolve(null),
)
const mockLocaleRedirect = mock((path: string) => Promise.resolve(`redirect:${path}` as never))
const mockHeaders = mock(() => Promise.resolve(new Headers()))
const mockGetCompanyByUserId = mock(async () => null as { status: string } | null)
const mockGetUniversityByUserId = mock(async () => null as { status: string } | null)

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

    await requireRole(["student"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/login")
  })

  test("should redirect to / when user role is not in allowed roles", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "student", name: "Student", email: "student@example.com" },
      session: {},
    })

    await requireRole(["super_admin"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/")
  })

  test("should return the user when role matches", async () => {
    const mockUser = { id: "user-1", role: "super_admin", name: "Admin", email: "admin@example.com" }
    mockGetSession.mockResolvedValue({ user: mockUser, session: {} })

    const result = await requireRole(["super_admin"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(result.id).toBe("user-1")
    expect(result.role).toBe("super_admin")
  })

  test("should allow any of multiple allowed roles", async () => {
    const mockUser = { id: "user-2", role: "company_admin", name: "Company Admin", email: "company@example.com" }
    mockGetSession.mockResolvedValue({ user: mockUser, session: {} })

    const result = await requireRole(["company_admin", "super_admin"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(result.id).toBe("user-2")
    expect(result.role).toBe("company_admin")
  })

  test("should pass headers to getSession", async () => {
    const customHeaders = new Headers({ authorization: "Bearer token" })
    mockHeaders.mockResolvedValue(customHeaders)
    mockGetSession.mockResolvedValue(null)

    await requireRole(["student"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(mockGetSession).toHaveBeenCalledWith({ headers: customHeaders })
  })

  test("should reject dept_head when only university_admin is allowed", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-3", role: "dept_head", name: "Dept Head", email: "dept@example.com" },
      session: {},
    })

    await requireRole(["university_admin"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/")
  })

  test("should redirect pending company_admin to company pending status", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-4", role: "company_admin", name: "Company Admin", email: "company4@example.com", onboardingCompleted: true },
      session: {},
    })
    mockGetCompanyByUserId.mockResolvedValue({ status: "pending" })

    await requireRole(["company_admin"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/status/company/pending")
  })

  test("should redirect pending university_admin to university pending status", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-5", role: "university_admin", name: "University Admin", email: "uni5@example.com", onboardingCompleted: true },
      session: {},
    })
    mockGetUniversityByUserId.mockResolvedValue({ status: "pending" })

    await requireRole(["university_admin"], {}, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/status/university/pending")
  })

  test("should allow pending users when allowUnapproved is true", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-6", role: "company_admin", name: "Company Admin", email: "company6@example.com", onboardingCompleted: true },
      session: {},
    })
    mockGetCompanyByUserId.mockResolvedValue({ status: "pending" })

    const result = await requireRole(["company_admin"], { allowUnapproved: true }, {
      getSession: mockGetSession,
      getHeaders: mockHeaders,
      localeRedirect: mockLocaleRedirect,
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(result.id).toBe("user-6")
    expect(result.role).toBe("company_admin")
  })
})
