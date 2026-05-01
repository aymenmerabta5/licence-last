import { beforeEach, describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { Suspense } from "react"

const requireRoleMock = mock(async () => ({ role: "student" }))
const isFeatureEnabledMock = mock(() => true)
const localeRedirectMock = mock(
  async (path: string) => `redirect:${path}` as never,
)

mock.module("@/lib/auth-guards", () => ({
  requireRole: requireRoleMock,
}))

mock.module("@/lib/feature-flags", () => ({
  FEATURE_FLAGS: {
    NOTIF_PREFERENCES: true,
    SAVED_OFFERS: true,
    INTERVIEWS: true,
    LANGUAGE_REQUIREMENTS: true,
  },
  isFeatureEnabled: isFeatureEnabledMock,
}))

mock.module("@/lib/navigation", () => ({
  localeRedirect: localeRedirectMock,
}))

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView",
  () => ({
    InterviewsView: ({ role }: { role: string }) => (
      <div data-testid="interviews-view">{role}</div>
    ),
  }),
)

const { default: InterviewsPage, InterviewsPageContent } = await import(
  "@/app/[locale]/(authenticated)/dashboard/interviews/page"
)

describe("dashboard/interviews/page", () => {
  beforeEach(() => {
    requireRoleMock.mockClear()
    isFeatureEnabledMock.mockClear()
    localeRedirectMock.mockClear()

    requireRoleMock.mockImplementation(async () => ({ role: "student" }))
    isFeatureEnabledMock.mockImplementation(() => true)
  })

  test("keeps the page shell synchronous so auth work can suspend under a boundary", () => {
    const page = InterviewsPage()

    expect(page).not.toBeInstanceOf(Promise)
    expect(requireRoleMock).not.toHaveBeenCalled()
    expect(page.type).toBe(Suspense)
  })

  test("always redirects students to applications", async () => {
    requireRoleMock.mockImplementation(async () => ({ role: "student" }))

    const result = await InterviewsPageContent()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard/applications")
    expect(result).toBeDefined()
  })

  test("redirects company admins when interviews feature is disabled", async () => {
    isFeatureEnabledMock.mockImplementation(() => false)
    requireRoleMock.mockImplementation(async () => ({ role: "company_admin" }))

    const result = await InterviewsPageContent()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard/company/offers")
    expect(result).toBeDefined()
  })

  test("renders interviews view when feature is enabled", async () => {
    isFeatureEnabledMock.mockImplementation(() => true)
    requireRoleMock.mockImplementation(async () => ({ role: "company_admin" }))

    render(await InterviewsPageContent())

    const view = screen.getByTestId("interviews-view")
    expect(view.textContent).toBe("company_admin")
  })
})
