import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

const requireCompanyOwnerMock = mock(async () => ({
  user: {
    id: "user-1",
    role: "company_admin",
  },
}))

let pageImportCounter = 0

function applyPageMocks() {
  mock.module("@/lib/dashboard-access", () => ({
    requireCompanyOwner: requireCompanyOwnerMock,
    requireApprovedCompanyAdmin: mock(async () => ({
      user: { id: "user-1", role: "company_admin" },
      company: { id: "company-1", name: "Acme", status: "approved" },
    })),
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
    requireCompanyOwnerMock.mockClear()

    requireCompanyOwnerMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "company_admin",
      },
    })
  })

  test("renders the team view for company owners", async () => {
    const { default: CompanyTeamPage } = await loadCompanyTeamPage()
    render(await CompanyTeamPage())

    expect(screen.getByTestId("company-team-view").textContent).toBe("user-1")
  })
})
