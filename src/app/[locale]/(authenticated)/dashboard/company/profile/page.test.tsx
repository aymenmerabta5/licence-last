import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

const requireCompanyOwnerMock = mock(async () => ({
  user: {
    id: "user-1",
    role: "company_admin",
    name: "Owner User",
  },
  company: {
    id: "company-1",
    name: "Acme",
    status: "approved",
    description: "Editorial internships",
    logoUrl: "",
    websiteUrl: "",
    phone: "",
    contactEmail: "",
    representativeName: "",
    wilayaCode: 16,
    address: "",
  },
  membership: {
    companyId: "company-1",
    role: "owner",
  },
}))
const getTranslationsMock = mock(
  async () => (key: string) =>
    ({
      title: "Company Profile",
      subtitle: "Governance workspace",
    })[key] ?? key,
)

let pageImportCounter = 0

function applyPageMocks() {
  mock.module("next-intl/server", () => ({
    getTranslations: getTranslationsMock,
  }))

  mock.module("@/lib/dashboard-access", () => ({
    requireCompanyOwner: requireCompanyOwnerMock,
    requireApprovedCompanyAdmin: mock(async () => ({
      user: { id: "user-1", role: "company_admin" },
      company: { id: "company-1", name: "Acme", status: "approved" },
    })),
  }))

  mock.module(
    "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm",
    () => ({
      CompanyProfileForm: ({
        initialData,
      }: {
        initialData: { canDeleteCompany: boolean; companyName: string }
      }) => (
        <div data-testid="company-profile-form">
          {JSON.stringify(initialData)}
        </div>
      ),
    }),
  )
}

async function loadCompanyProfilePage() {
  pageImportCounter += 1
  return import(
    `@/app/[locale]/(authenticated)/dashboard/company/profile/page?test=${pageImportCounter}`
  )
}

describe("dashboard/company/profile/page", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    applyPageMocks()
    requireCompanyOwnerMock.mockClear()
    getTranslationsMock.mockClear()

    requireCompanyOwnerMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "company_admin",
        name: "Owner User",
      },
      company: {
        id: "company-1",
        name: "Acme",
        status: "approved",
        description: "Editorial internships",
        logoUrl: "",
        websiteUrl: "",
        phone: "",
        contactEmail: "",
        representativeName: "",
        wilayaCode: 16,
        address: "",
      },
      membership: {
        companyId: "company-1",
        role: "owner",
      },
    })
  })

  test("renders the profile form for company owners", async () => {
    const { CompanyProfilePageContent } = await loadCompanyProfilePage()
    render(await CompanyProfilePageContent())

    expect(screen.getByTestId("company-profile-form").textContent).toContain(
      '"canDeleteCompany":true',
    )
    expect(screen.getByText("Acme")).toBeDefined()
  })
})
