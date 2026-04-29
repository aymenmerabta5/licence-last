import { afterAll, describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

const suspendedOffers = new Promise<void>(() => {})

mock.module("next-intl/server", () => ({
  getTranslations: mock(
    async () => (key: string) =>
      ({
        kicker: "Company profile",
        website: "Website",
        trustIndex: "Trust index",
        openOffers: "Open offers",
        noOffers: "No offers",
        positions: "positions",
      })[key] ?? key,
  ),
}))

mock.module("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    back: mock(() => {}),
    forward: mock(() => {}),
    refresh: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}))

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mock(async () => null),
    },
  },
}))

mock.module("@/lib/wilayas", () => ({
  getWilayaName: () => "Algiers",
}))

mock.module("@/server/orpc/client", () => ({
  orpcClient: {
    companies: {
      getById: mock(async () => null),
    },
  },
  orpc: {
    placements: {
      getPendingById: {
        queryOptions: ({ input }: { input: { applicationId: string } }) => ({
          queryKey: ["placements", "getPendingById", input],
          queryFn: async () => ({ application: { id: input.applicationId } }),
        }),
      },
    },
    deptHead: {
      getPendingById: {
        queryOptions: ({ input }: { input: { applicationId: string } }) => ({
          queryKey: ["deptHead", "getPendingById", input],
          queryFn: async () => ({ application: { id: input.applicationId } }),
        }),
      },
    },
  },
}))

mock.module("@/server/services/companies/get-public-by-slug", () => ({
  getPublicCompanyBySlug: mock(async () => ({
    id: "company-1",
    name: "Acme Inc",
    slug: "acme",
    logoUrl: null,
    description: "Editorial internships for product designers.",
    websiteUrl: "https://acme.test",
    wilayaCode: "16",
  })),
}))

mock.module("@/server/services/companies/trust-index", () => ({
  getCompanyTrustIndex: mock(async () => ({
    trustScore: 88,
    tier: "Gold",
  })),
}))

mock.module("@/server/services/offers/list-public-by-company", () => ({
  listPublicOffersByCompany: mock(async () => [
    {
      id: "offer-1",
      title: "Frontend Internship",
      internshipType: "Remote",
      maxPositions: 2,
    },
  ]),
}))

mock.module(
  "@/app/[locale]/company/[slug]/_components/CompanyOffersSection",
  () => ({
    CompanyOffersSection: () => {
      throw suspendedOffers
    },
  }),
)

mock.module("@/server/services/companies/get", () => ({
  getCompanyById: mock(async () => ({
    id: "company-1",
    name: "Acme Inc",
    slug: "acme",
    logoUrl: null,
    description: "Editorial internships for product designers.",
    websiteUrl: "https://acme.test",
    wilayaCode: 16,
    status: "approved",
    representativeName: "John Doe",
    contactEmail: "contact@acme.test",
    phone: null,
    address: null,
    createdAt: new Date(),
  })),
}))

const { default: CompanyPublicProfilePage } = await import(
  "@/app/[locale]/company/[slug]/page"
)

describe("CompanyPublicProfilePage", () => {
  afterAll(() => {
    mock.restore()
  })

  test("renders the static company shell while the request-bound offers section suspends", async () => {
    render(
      await CompanyPublicProfilePage({
        params: Promise.resolve({ slug: "acme" }),
      }),
    )

    expect(screen.getByRole("heading", { name: "Acme Inc" })).toBeDefined()
    expect(screen.getByText("Open offers")).toBeDefined()
    expect(screen.getByLabelText("Loading company offers")).toBeDefined()
  })
})
