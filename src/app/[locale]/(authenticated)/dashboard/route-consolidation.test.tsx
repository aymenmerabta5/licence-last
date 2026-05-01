import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import { Suspense } from "react"

const requireRoleMock = mock(async () => ({
  id: "student-1",
  role: "student",
  onboardingCompleted: true,
}))
const localeRedirectMock = mock(
  async (path: string) => `redirect:${path}` as never,
)

let importCounter = 0

function applyRouteMocks() {
  mock.module("@/lib/auth-guards", () => ({
    requireRole: requireRoleMock,
  }))

  mock.module("@/lib/navigation", () => ({
    localeRedirect: localeRedirectMock,
  }))

  mock.module("@/lib/dashboard-access", () => ({
    requireOnboardedStudent: async () => {
      const user = await requireRoleMock()
      if (!user.onboardingCompleted) {
        return localeRedirectMock("/onboarding/student")
      }
      return { user }
    },
    requireApprovedCompanyAdmin: async () => ({
      user: {
        id: "company-user-1",
        role: "company_admin",
        onboardingCompleted: true,
      },
      company: {
        id: "company-1",
        name: "Acme",
        status: "approved",
      },
    }),
    requireCompanyOwner: async () => ({
      user: {
        id: "company-user-1",
        role: "company_admin",
        onboardingCompleted: true,
      },
      company: {
        id: "company-1",
        name: "Acme",
        status: "approved",
      },
      membership: {
        companyId: "company-1",
        role: "owner",
      },
    }),
  }))

  mock.module(
    "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient",
    () => ({
      ExploreClient: () => <div data-testid="explore-client">explore</div>,
    }),
  )

  mock.module(
    "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/ApplicationsHubController",
    () => ({
      ApplicationsHubController: () => (
        <div data-testid="applications-hub">applications hub</div>
      ),
    }),
  )
}

async function loadModule(path: string) {
  importCounter += 1
  return import(`${path}?test=${importCounter}`)
}

describe("dashboard route consolidation", () => {
  beforeEach(() => {
    applyRouteMocks()
    requireRoleMock.mockClear()
    localeRedirectMock.mockClear()
    requireRoleMock.mockResolvedValue({
      id: "student-1",
      role: "student",
      onboardingCompleted: true,
    })
  })

  afterEach(() => {
    cleanup()
  })

  test("redirects legacy student landing page to the canonical dashboard", async () => {
    const { default: StudentDashboardPage, StudentDashboardPageContent } =
      await loadModule("@/app/[locale]/(authenticated)/dashboard/student/page")

    const page = StudentDashboardPage()
    const result = await StudentDashboardPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects legacy company landing page to the canonical dashboard", async () => {
    const { default: CompanyDashboardPage } = await loadModule(
      "@/app/[locale]/(authenticated)/dashboard/company/page",
    )

    const result = await CompanyDashboardPage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("redirects legacy admin landing page to the canonical dashboard", async () => {
    const { default: AdminDashboardPage } = await loadModule(
      "@/app/[locale]/(authenticated)/dashboard/admin/page",
    )

    const result = await AdminDashboardPage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard")
    expect(result).toBeDefined()
  })

  test("renders the canonical explore page for onboarded students", async () => {
    const { default: ExplorePage, ExplorePageContent } = await loadModule(
      "@/app/[locale]/(authenticated)/dashboard/explore/page",
    )

    const page = ExplorePage()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(requireRoleMock).not.toHaveBeenCalled()

    render(await ExplorePageContent())

    expect(screen.getByTestId("explore-client").textContent).toBe("explore")
    expect(localeRedirectMock).not.toHaveBeenCalled()
  })

  test("redirects non-onboarded students away from the canonical explore page", async () => {
    const { default: ExplorePage, ExplorePageContent } = await loadModule(
      "@/app/[locale]/(authenticated)/dashboard/explore/page",
    )
    requireRoleMock.mockResolvedValueOnce({
      id: "student-1",
      role: "student",
      onboardingCompleted: false,
    })

    const page = ExplorePage()
    const result = await ExplorePageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/onboarding/student")
    expect(result).toBeDefined()
  })

  test("renders the canonical applications page for onboarded students", async () => {
    const { default: ApplicationsPage, ApplicationsPageContent } =
      await loadModule(
        "@/app/[locale]/(authenticated)/dashboard/applications/page",
      )

    const page = ApplicationsPage()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(requireRoleMock).not.toHaveBeenCalled()

    render(await ApplicationsPageContent())

    expect(screen.getByTestId("applications-hub").textContent).toBe(
      "applications hub",
    )
    expect(localeRedirectMock).not.toHaveBeenCalled()
  })

  test("redirects non-onboarded students away from the canonical applications page", async () => {
    const { default: ApplicationsPage, ApplicationsPageContent } =
      await loadModule(
        "@/app/[locale]/(authenticated)/dashboard/applications/page",
      )
    requireRoleMock.mockResolvedValueOnce({
      id: "student-1",
      role: "student",
      onboardingCompleted: false,
    })

    const page = ApplicationsPage()
    const result = await ApplicationsPageContent()

    expect(page).not.toBeInstanceOf(Promise)
    expect(page.type).toBe(Suspense)
    expect(localeRedirectMock).toHaveBeenCalledWith("/onboarding/student")
    expect(result).toBeDefined()
  })

  test("redirects the legacy student search page to the canonical explore page", async () => {
    const { default: StudentSearchPage } = await loadModule(
      "@/app/[locale]/(authenticated)/dashboard/student/search/page",
    )

    const result = await StudentSearchPage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard/explore")
    expect(result).toBeDefined()
  })

  test("redirects the legacy student applications page to the canonical applications page", async () => {
    const { default: StudentApplicationsPage } = await loadModule(
      "@/app/[locale]/(authenticated)/dashboard/student/applications/page",
    )

    const result = await StudentApplicationsPage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard/applications")
    expect(result).toBeDefined()
  })

  test("redirects the legacy student offer detail page to the canonical explore detail page", async () => {
    const { default: StudentOfferDetailPage } = await loadModule(
      "@/app/[locale]/(authenticated)/dashboard/student/offers/[offerId]/page",
    )

    const result = await StudentOfferDetailPage({
      params: Promise.resolve({ offerId: "offer-42" }),
    })

    expect(localeRedirectMock).toHaveBeenCalledWith(
      "/dashboard/explore/offer-42",
    )
    expect(result).toBeDefined()
  })
})
