import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

const requireRoleMock = mock(async () => ({
  id: "user-1",
  role: "company_admin",
}))
const localeRedirectMock = mock(
  async (path: string) => `redirect:${path}` as never,
)
const getCompanyByUserIdMock = mock(async () => ({
  id: "company-1",
  status: "approved",
}))
const getCompanyMembershipMock = mock(async () => ({
  companyId: "company-1",
  role: "owner",
}))

let pageImportCounter = 0

function applyPageMocks() {
  mock.module("@/lib/auth-guards", () => ({
    requireRole: requireRoleMock,
  }))

  mock.module("@/lib/navigation", () => ({
    localeRedirect: localeRedirectMock,
  }))

  mock.module("@/server/services/companies/get", () => ({
    getCompanyByUserId: getCompanyByUserIdMock,
  }))

  mock.module("@/server/services/companies/membership", () => ({
    getCompanyMembership: getCompanyMembershipMock,
  }))

  mock.module(
    "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView",
    () => ({
      CompanyTeamView: ({ currentUserId }: { currentUserId: string }) => (
        <div data-testid="company-team-view">{currentUserId}</div>
      ),
    }),
  )
}

async function loadCompanyTeamPage() {
  pageImportCounter += 1
  return import(
    `@/app/[locale]/(authenticated)/dashboard/company/team/page?test=${pageImportCounter}`
  )
}

describe("dashboard/company/team/page", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    applyPageMocks()
    requireRoleMock.mockClear()
    localeRedirectMock.mockClear()
    getCompanyByUserIdMock.mockClear()
    getCompanyMembershipMock.mockClear()

    requireRoleMock.mockResolvedValue({
      id: "user-1",
      role: "company_admin",
    })
    getCompanyByUserIdMock.mockResolvedValue({
      id: "company-1",
      status: "approved",
    })
    getCompanyMembershipMock.mockResolvedValue({
      companyId: "company-1",
      role: "owner",
    })
  })

  test("redirects recruiters away from the company team page", async () => {
    const { default: CompanyTeamPage } = await loadCompanyTeamPage()
    getCompanyMembershipMock.mockResolvedValueOnce({
      companyId: "company-1",
      role: "recruiter",
    })

    const result = await CompanyTeamPage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard/company")
    expect(result).toBeDefined()
  })

  test("renders the team view for company owners", async () => {
    const { default: CompanyTeamPage } = await loadCompanyTeamPage()
    render(await CompanyTeamPage())

    expect(screen.getByTestId("company-team-view").textContent).toBe("user-1")
  })
})
