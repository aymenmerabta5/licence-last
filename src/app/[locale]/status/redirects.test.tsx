import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { Suspense } from "react"

interface MockRoleUser {
  id: string
  role: "company_admin" | "university_admin"
}

interface MockStatus {
  status: string
}

const requireRoleMock = mock<() => Promise<MockRoleUser>>(async () => ({
  id: "user-1",
  role: "company_admin",
}))
const localeRedirectMock = mock(
  async (path: string) => `redirect:${path}` as never,
)
const getCompanyStatusByUserIdMock = mock<() => Promise<MockStatus | null>>(
  async () => null,
)
const getUniversityStatusByUserIdMock = mock<() => Promise<MockStatus | null>>(
  async () => null,
)
const getCompanyByUserIdMock = mock<() => Promise<unknown | null>>(
  async () => null,
)
const getCompanyByIdMock = mock<() => Promise<unknown | null>>(async () => null)

let importCounter = 0

mock.module("@/lib/auth-guards", () => ({
  requireRole: requireRoleMock,
}))

mock.module("@/lib/navigation", () => ({
  localeRedirect: localeRedirectMock,
}))

mock.module("@/server/services/companies/get-status", () => ({
  getCompanyStatusByUserId: getCompanyStatusByUserIdMock,
}))

mock.module("@/server/services/companies/get", () => ({
  getCompanyById: getCompanyByIdMock,
  getCompanyByUserId: getCompanyByUserIdMock,
}))

mock.module("@/server/services/universities/get-status", () => ({
  getUniversityStatusByUserId: getUniversityStatusByUserIdMock,
}))

async function loadModule(path: string) {
  importCounter += 1
  return import(`${path}?test=${importCounter}`)
}

describe("status redirects", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    requireRoleMock.mockClear()
    localeRedirectMock.mockClear()
    getCompanyStatusByUserIdMock.mockClear()
    getUniversityStatusByUserIdMock.mockClear()
    getCompanyByIdMock.mockClear()
    getCompanyByUserIdMock.mockClear()
  })

  test("redirects approved company users from the pending page to the canonical dashboard", async () => {
    const { default: CompanyPendingPage, CompanyPendingPageContent } =
      await loadModule(
      "@/app/[locale]/status/company/pending/page",
      )
    getCompanyStatusByUserIdMock.mockResolvedValueOnce({ status: "approved" })

    const page = CompanyPendingPage()
    const result = await CompanyPendingPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects approved company users from the rejected page to the canonical dashboard", async () => {
    const { default: CompanyRejectedPage, CompanyRejectedPageContent } =
      await loadModule(
      "@/app/[locale]/status/company/rejected/page",
      )
    getCompanyStatusByUserIdMock.mockResolvedValueOnce({ status: "approved" })

    const page = CompanyRejectedPage()
    const result = await CompanyRejectedPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects approved company users from the suspended page to the canonical dashboard", async () => {
    const { default: CompanySuspendedPage, CompanySuspendedPageContent } =
      await loadModule(
      "@/app/[locale]/status/company/suspended/page",
      )
    getCompanyStatusByUserIdMock.mockResolvedValueOnce({ status: "approved" })

    const page = CompanySuspendedPage()
    const result = await CompanySuspendedPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects approved university users from the pending page to the canonical dashboard", async () => {
    const { default: UniversityPendingPage, UniversityPendingPageContent } =
      await loadModule(
      "@/app/[locale]/status/university/pending/page",
      )
    requireRoleMock.mockResolvedValueOnce({
      id: "user-1",
      role: "university_admin",
    })
    getUniversityStatusByUserIdMock.mockResolvedValueOnce({
      status: "approved",
    })

    const page = UniversityPendingPage()
    const result = await UniversityPendingPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects approved university users from the rejected page to the canonical dashboard", async () => {
    const { default: UniversityRejectedPage, UniversityRejectedPageContent } =
      await loadModule(
      "@/app/[locale]/status/university/rejected/page",
      )
    requireRoleMock.mockResolvedValueOnce({
      id: "user-1",
      role: "university_admin",
    })
    getUniversityStatusByUserIdMock.mockResolvedValueOnce({
      status: "approved",
    })

    const page = UniversityRejectedPage()
    const result = await UniversityRejectedPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })
})
