import { beforeEach, describe, expect, mock, test } from "bun:test"
import { Suspense } from "react"

interface MockSession {
  user: {
    id: string
    onboardingCompleted: boolean
    role?: string
  }
}

interface MockStatus {
  status: string
}

const headersMock = mock(async () => new Headers())
const getFreshAuthSessionMock = mock<() => Promise<MockSession | null>>(
  async () => null,
)
const localeRedirectMock = mock(
  async (path: string) => `redirect:${path}` as never,
)
const getCompanyStatusByUserIdMock = mock<() => Promise<MockStatus | null>>(
  async () => null,
)
const getUniversityStatusByUserIdMock = mock<() => Promise<MockStatus | null>>(
  async () => null,
)

let importCounter = 0

mock.module("next/headers", () => ({
  headers: headersMock,
}))

mock.module("@/server/auth/get-fresh-session", () => ({
  getFreshAuthSession: getFreshAuthSessionMock,
}))

mock.module("@/lib/navigation", () => ({
  localeRedirect: localeRedirectMock,
}))

mock.module("@/server/services/companies/get-status", () => ({
  getCompanyStatusByUserId: getCompanyStatusByUserIdMock,
}))

mock.module("@/server/services/universities/get-status", () => ({
  getUniversityStatusByUserId: getUniversityStatusByUserIdMock,
}))

mock.module(
  "@/app/[locale]/onboarding/company/_components/CompanyOnboardingForm",
  () => ({
    CompanyOnboardingForm: () => <div>company form</div>,
  }),
)

mock.module(
  "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm",
  () => ({
    UniversityOnboardingForm: () => <div>university form</div>,
  }),
)

async function loadModule(path: string) {
  importCounter += 1
  return import(`${path}?test=${importCounter}`)
}

describe("onboarding redirects", () => {
  beforeEach(() => {
    headersMock.mockClear()
    getFreshAuthSessionMock.mockClear()
    localeRedirectMock.mockClear()
    getCompanyStatusByUserIdMock.mockClear()
    getUniversityStatusByUserIdMock.mockClear()
  })

  test("redirects approved companies to the canonical dashboard", async () => {
    const { default: CompanyOnboardingPage, CompanyOnboardingPageContent } =
      await loadModule("@/app/[locale]/onboarding/company/page")
    getFreshAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "company-user",
        onboardingCompleted: true,
        role: "company_admin",
      },
    })
    getCompanyStatusByUserIdMock.mockResolvedValueOnce({
      status: "approved",
    })

    const page = CompanyOnboardingPage()
    const result = await CompanyOnboardingPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects company admins away from the student onboarding form", async () => {
    const { StudentOnboardingPageContent } = await loadModule(
      "@/app/[locale]/onboarding/student/page",
    )
    getFreshAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "company-user",
        onboardingCompleted: false,
        role: "company_admin",
      },
    })

    const result = await StudentOnboardingPageContent()

    expect(localeRedirectMock).toHaveBeenCalledWith("/onboarding/company")
    expect(result).toBeDefined()
  })

  test("redirects approved universities to the canonical dashboard", async () => {
    const {
      default: UniversityOnboardingPage,
      UniversityOnboardingPageContent,
    } = await loadModule("@/app/[locale]/onboarding/university/page")
    getFreshAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "university-user",
        onboardingCompleted: true,
        role: "university_admin",
      },
    })
    getUniversityStatusByUserIdMock.mockResolvedValueOnce({
      status: "approved",
    })

    const page = UniversityOnboardingPage()
    const result = await UniversityOnboardingPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects students away from the university onboarding form", async () => {
    const { UniversityOnboardingPageContent } = await loadModule(
      "@/app/[locale]/onboarding/university/page",
    )
    getFreshAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "student-user",
        onboardingCompleted: false,
        role: "student",
      },
    })

    const result = await UniversityOnboardingPageContent()

    expect(localeRedirectMock).toHaveBeenCalledWith("/onboarding/student")
    expect(result).toBeDefined()
  })
})
