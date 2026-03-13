import { beforeEach, describe, expect, mock, test } from "bun:test"

interface MockSession {
  user: {
    id: string
    onboardingCompleted: boolean
  }
}

interface MockStatus {
  status: string
}

const headersMock = mock(async () => new Headers())
const getSessionMock = mock<() => Promise<MockSession | null>>(async () => null)
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

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
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
    getSessionMock.mockClear()
    localeRedirectMock.mockClear()
    getCompanyStatusByUserIdMock.mockClear()
    getUniversityStatusByUserIdMock.mockClear()
  })

  test("redirects approved companies to the canonical dashboard", async () => {
    const { default: CompanyOnboardingPage } = await loadModule(
      "@/app/[locale]/onboarding/company/page",
    )
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "company-user",
        onboardingCompleted: true,
      },
    })
    getCompanyStatusByUserIdMock.mockResolvedValueOnce({
      status: "approved",
    })

    const result = await CompanyOnboardingPage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects approved universities to the canonical dashboard", async () => {
    const { default: UniversityOnboardingPage } = await loadModule(
      "@/app/[locale]/onboarding/university/page",
    )
    getSessionMock.mockResolvedValueOnce({
      user: {
        id: "university-user",
        onboardingCompleted: true,
      },
    })
    getUniversityStatusByUserIdMock.mockResolvedValueOnce({
      status: "approved",
    })

    const result = await UniversityOnboardingPage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })
})
