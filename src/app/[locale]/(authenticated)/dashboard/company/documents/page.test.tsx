import { beforeEach, describe, expect, mock, test } from "bun:test"
import { Suspense } from "react"

const requireApprovedCompanyAdminMock = mock(async () => ({
  user: {
    id: "user-1",
    role: "company_admin",
    name: "Owner User",
  },
  company: {
    id: "company-1",
    name: "Acme",
    status: "approved",
  },
}))

let pageImportCounter = 0

function applyPageMocks() {
  mock.module("@/lib/dashboard-access", () => ({
    requireApprovedCompanyAdmin: requireApprovedCompanyAdminMock,
  }))

  mock.module(
    "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView",
    () => ({
      CompanyDocumentsView: () => (
        <div data-testid="company-documents-view">Company Documents</div>
      ),
    }),
  )
}

async function loadCompanyDocumentsPage() {
  pageImportCounter += 1
  return import(
    `@/app/[locale]/(authenticated)/dashboard/company/documents/page?test=${pageImportCounter}`
  )
}

describe("dashboard/company/documents/page", () => {
  beforeEach(() => {
    applyPageMocks()
    requireApprovedCompanyAdminMock.mockClear()
  })

  test("should keep the page shell synchronous so auth work can suspend under a boundary", async () => {
    const { default: CompanyDocumentsPage } = await loadCompanyDocumentsPage()

    const page = CompanyDocumentsPage()

    expect(page).not.toBeInstanceOf(Promise)
    expect(requireApprovedCompanyAdminMock).not.toHaveBeenCalled()
    expect(page.type).toBe(Suspense)
  })
})
