import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

const requireRoleMock = mock(async () => ({
  id: "user-1",
  role: "company_admin",
  name: "Owner User",
}))
const localeRedirectMock = mock(
  async (path: string) => `redirect:${path}` as never,
)
const getCompanyByUserIdMock = mock(async () => ({
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
}))
const getCompanyMembershipMock = mock(async () => ({
  companyId: "company-1",
  role: "owner",
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
    requireRoleMock.mockClear()
    localeRedirectMock.mockClear()
    getCompanyByUserIdMock.mockClear()
    getCompanyMembershipMock.mockClear()
    getTranslationsMock.mockClear()

    requireRoleMock.mockResolvedValue({
      id: "user-1",
      role: "company_admin",
      name: "Owner User",
    })
    getCompanyByUserIdMock.mockResolvedValue({
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
    })
    getCompanyMembershipMock.mockResolvedValue({
      companyId: "company-1",
      role: "owner",
    })
  })

  test("redirects recruiters away from the company profile page", async () => {
    const { default: CompanyProfilePage } = await loadCompanyProfilePage()
    getCompanyMembershipMock.mockResolvedValueOnce({
      companyId: "company-1",
      role: "recruiter",
    })

    const result = await CompanyProfilePage()

    expect(localeRedirectMock).toHaveBeenCalledWith("/dashboard/company")
    expect(result).toBeDefined()
  })

  test("renders the profile form for company owners", async () => {
    const { default: CompanyProfilePage } = await loadCompanyProfilePage()
    render(await CompanyProfilePage())

    expect(screen.getByTestId("company-profile-form").textContent).toContain(
      '"canDeleteCompany":true',
    )
    expect(screen.getByText("Acme")).toBeDefined()
  })
})
