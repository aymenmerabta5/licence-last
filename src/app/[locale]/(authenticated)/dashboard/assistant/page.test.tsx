import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
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

const getTranslationsMock = mock(async () => (key: string) => key)

let pageImportCounter = 0

function applyPageMocks() {
  mock.module("@/lib/dashboard-access", () => ({
    requireApprovedCompanyAdmin: requireApprovedCompanyAdminMock,
    requireCompanyOwner: mock(async () => ({
      user: { id: "user-1", role: "company_admin" },
      company: { id: "company-1", name: "Acme", status: "approved" },
      membership: { companyId: "company-1", role: "owner" },
    })),
  }))

  mock.module("next-intl/server", () => ({
    getTranslations: getTranslationsMock,
  }))

  mock.module(
    "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantPageContent",
    () => ({
      AssistantPageContent: () => (
        <div data-testid="assistant-chat">Assistant Chat</div>
      ),
    }),
  )
}

async function loadAssistantPage() {
  pageImportCounter += 1
  return import(
    `@/app/[locale]/(authenticated)/dashboard/assistant/page?test=${pageImportCounter}`
  )
}

describe("dashboard/assistant/page", () => {
  beforeEach(() => {
    applyPageMocks()
    requireApprovedCompanyAdminMock.mockClear()
    getTranslationsMock.mockClear()
  })

  afterEach(() => {})

  test("should keep the page shell synchronous so auth work can suspend under a boundary", async () => {
    const { default: AssistantPage } = await loadAssistantPage()

    const page = AssistantPage()

    expect(page).not.toBeInstanceOf(Promise)
    expect(requireApprovedCompanyAdminMock).not.toHaveBeenCalled()
    expect(getTranslationsMock).not.toHaveBeenCalled()
    expect(page.type).toBe(Suspense)
  })
})
