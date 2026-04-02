import { beforeEach, describe, expect, mock, test } from "bun:test"

import { requireRole } from "@/lib/auth-guards"

interface SessionUser {
  id: string
  role: string
  name: string | null
  email: string
  banned?: boolean
  onboardingCompleted?: boolean
  [key: string]: unknown
}

type SessionResult = {
  user: SessionUser
  session: Record<string, unknown>
} | null

const mockGetSession = mock<
  (input: { headers: Headers }) => Promise<SessionResult>
>(() => Promise.resolve(null))
const mockLocaleRedirect = mock((path: string) =>
  Promise.resolve(`redirect:${path}` as never),
)
const mockHeaders = mock(() => Promise.resolve(new Headers()))
const mockGetCompanyStatusByUserId = mock(
  async () => null as { status: string } | null,
)
const mockGetUniversityStatusByUserId = mock(
  async () => null as { status: string } | null,
)
const mockGetUniversityMembership = mock(
  async () =>
    null as {
      universityId: string
      userId: string
      role: "department_head"
      departmentId: string | null
    } | null,
)

describe("requireRole", () => {
  beforeEach(() => {
    mockGetSession.mockClear()
    mockLocaleRedirect.mockClear()
    mockHeaders.mockClear()
    mockGetCompanyStatusByUserId.mockClear()
    mockGetUniversityStatusByUserId.mockClear()
    mockGetUniversityMembership.mockClear()

    mockHeaders.mockResolvedValue(new Headers())
    mockGetCompanyStatusByUserId.mockResolvedValue(null)
    mockGetUniversityStatusByUserId.mockResolvedValue(null)
    mockGetUniversityMembership.mockResolvedValue(null)
  })

  test("should redirect to /login when no session exists", async () => {
    mockGetSession.mockResolvedValue(null)

    await requireRole(
      ["student"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/login")
  })

  test("should redirect to / when user role is not in allowed roles", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-1",
        role: "student",
        name: "Student",
        email: "student@example.com",
      },
      session: {},
    })

    await requireRole(
      ["super_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/")
  })

  test("should redirect banned users to /", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-banned",
        role: "student",
        name: "Banned User",
        email: "banned@example.com",
        banned: true,
      },
      session: {},
    })

    await requireRole(
      ["student"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/")
  })

  test("should return the user when role matches", async () => {
    const mockUser = {
      id: "user-1",
      role: "super_admin",
      name: "Admin",
      email: "admin@example.com",
    }
    mockGetSession.mockResolvedValue({ user: mockUser, session: {} })

    const result = await requireRole(
      ["super_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(result.id).toBe("user-1")
    expect(result.role).toBe("super_admin")
  })

  test("should allow any of multiple allowed roles", async () => {
    const mockUser = {
      id: "user-2",
      role: "company_admin",
      name: "Company Admin",
      email: "company@example.com",
    }
    mockGetSession.mockResolvedValue({ user: mockUser, session: {} })

    const result = await requireRole(
      ["company_admin", "super_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(result.id).toBe("user-2")
    expect(result.role).toBe("company_admin")
  })

  test("should pass headers to getSession", async () => {
    const customHeaders = new Headers({ authorization: "Bearer token" })
    mockHeaders.mockResolvedValue(customHeaders)
    mockGetSession.mockResolvedValue(null)

    await requireRole(
      ["student"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(mockGetSession).toHaveBeenCalledWith({ headers: customHeaders })
  })

  test("should allow department-head user when university_admin is allowed (they are university_admin)", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-3",
        role: "university_admin",
        name: "Dept Head",
        email: "dept@example.com",
      },
      session: {},
    })
    mockGetUniversityMembership.mockResolvedValue({
      universityId: "uni-1",
      userId: "user-3",
      role: "department_head",
      departmentId: "dept-1",
    })

    const result = await requireRole(
      ["university_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(result.role).toBe("university_admin")
    expect(result.universityMembershipRole).toBe("department_head")
  })

  test("should resolve department-head membership role on university_admin user", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-3a",
        role: "university_admin",
        name: "Dept Head",
        email: "dept@example.com",
      },
      session: {},
    })
    mockGetUniversityMembership.mockResolvedValue({
      universityId: "uni-1",
      userId: "user-3a",
      role: "department_head",
      departmentId: "dept-1",
    })

    const result = await requireRole(
      ["university_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(result.id).toBe("user-3a")
    expect(result.role).toBe("university_admin")
    expect(result.effectiveRole).toBe("university_admin")
    expect(result.rawRole).toBe("university_admin")
    expect(result.universityMembershipRole).toBe("department_head")
    expect(result.universityDepartmentId).toBe("dept-1")
  })

  test("should redirect pending company_admin to company pending status", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-4",
        role: "company_admin",
        name: "Company Admin",
        email: "company4@example.com",
        onboardingCompleted: true,
      },
      session: {},
    })
    mockGetCompanyStatusByUserId.mockResolvedValue({ status: "pending" })

    await requireRole(
      ["company_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/status/company/pending")
  })

  test("should redirect suspended company_admin to company suspended status", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-4b",
        role: "company_admin",
        name: "Company Admin",
        email: "company4b@example.com",
        onboardingCompleted: true,
      },
      session: {},
    })
    mockGetCompanyStatusByUserId.mockResolvedValue({ status: "suspended" })

    await requireRole(
      ["company_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(mockLocaleRedirect).toHaveBeenCalledWith("/status/company/suspended")
  })

  test("should redirect pending university_admin to university pending status", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-5",
        role: "university_admin",
        name: "University Admin",
        email: "uni5@example.com",
        onboardingCompleted: true,
      },
      session: {},
    })
    mockGetUniversityStatusByUserId.mockResolvedValue({ status: "pending" })

    await requireRole(
      ["university_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(mockLocaleRedirect).toHaveBeenCalledWith(
      "/status/university/pending",
    )
  })

  test("should allow pending users when allowUnapproved is true", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-6",
        role: "company_admin",
        name: "Company Admin",
        email: "company6@example.com",
        onboardingCompleted: true,
      },
      session: {},
    })
    mockGetCompanyStatusByUserId.mockResolvedValue({ status: "pending" })

    const result = await requireRole(
      ["company_admin"],
      { allowUnapproved: true },
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(result.id).toBe("user-6")
    expect(result.role).toBe("company_admin")
  })

  test("should skip approval checks when onboarding is not completed", async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-7",
        role: "company_admin",
        name: "Company Admin",
        email: "company7@example.com",
        onboardingCompleted: false,
      },
      session: {},
    })

    const result = await requireRole(
      ["company_admin"],
      {},
      {
        getSession: mockGetSession,
        getHeaders: mockHeaders,
        localeRedirect: mockLocaleRedirect,
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
        getUniversityMembership: mockGetUniversityMembership,
      },
    )

    expect(result.id).toBe("user-7")
    expect(mockGetCompanyStatusByUserId).not.toHaveBeenCalled()
  })
})
