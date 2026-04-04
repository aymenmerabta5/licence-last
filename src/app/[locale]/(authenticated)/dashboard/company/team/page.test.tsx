import { beforeEach, describe, expect, mock, test } from "bun:test"
import { Suspense } from "react"

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

  test("keeps the page shell synchronous so ownership checks can suspend under a boundary", async () => {
    const { default: CompanyTeamPage } = await loadCompanyTeamPage()
    const page = CompanyTeamPage()

    expect(page).not.toBeInstanceOf(Promise)
    expect(requireCompanyOwnerMock).not.toHaveBeenCalled()
    expect(page.type).toBe(Suspense)
  })
})
