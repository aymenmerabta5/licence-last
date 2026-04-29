import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockAppliedRows: any[] = []

const searchOffersMock = mock(async () => ({
  offers: [
    {
      id: "offer-1",
      companyId: "company-1",
      title: "Offer 1",
      description: "Desc 1",
      internshipType: "pfe" as const,
      workMode: "remote" as const,
      wilayaCode: 16,
      durationWeeks: 12,
      maxPositions: 2,
      status: "published" as const,
      applicationDeadlineAt: null,
      expectedStartDate: null,
      expectedEndDate: null,
      closesAt: null,
      createdAt: new Date("2026-01-05T00:00:00.000Z"),
      companyName: "Acme",
      companySlug: "acme",
      companyLogoUrl: null,
      companyWilayaCode: 16,
      skills: [],
      languageRequirements: [],
    },
    {
      id: "offer-2",
      companyId: "company-2",
      title: "Offer 2",
      description: "Desc 2",
      internshipType: "summer" as const,
      workMode: "hybrid" as const,
      wilayaCode: 31,
      durationWeeks: 8,
      maxPositions: 1,
      status: "published" as const,
      applicationDeadlineAt: null,
      expectedStartDate: null,
      expectedEndDate: null,
      closesAt: null,
      createdAt: new Date("2026-01-06T00:00:00.000Z"),
      companyName: "Beta",
      companySlug: "beta",
      companyLogoUrl: null,
      companyWilayaCode: 31,
      skills: [],
      languageRequirements: [],
    },
  ],
  hasMore: false,
  nextCursor: undefined,
}))

const getExplainableMatchScoreMock = mock(
  async (_studentId: string, offerId: string) => ({
    score: offerId === "offer-1" ? 65 : 88,
  }),
)

mock.module("@/server/services/matching/score", () => ({
  getExplainableMatchScore: getExplainableMatchScoreMock,
}))

mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => mockAppliedRows,
      }),
    }),
  },
}))

describe("src/server/services/offers/recommend", () => {
  beforeEach(() => {
    mockAppliedRows = []
    searchOffersMock.mockClear()
    getExplainableMatchScoreMock.mockClear()
  })

  test("ranks recommended offers by match score descending", async () => {
    const { recommendOffersForStudent } = await import(
      "@/server/services/offers/recommend"
    )
    const result = await recommendOffersForStudent(
      { studentUserId: "student-1", limit: 2 },
      { searchOffers: searchOffersMock },
    )

    expect(result.offers).toHaveLength(2)
    expect(result.offers[0]?.id).toBe("offer-2")
    expect(result.offers[0]?.matchScore).toBe(88)
    expect(result.offers[1]?.id).toBe("offer-1")
  })

  test("excludes offers already applied by the student", async () => {
    mockAppliedRows = [{ offerId: "offer-2" }]

    const { recommendOffersForStudent } = await import(
      "@/server/services/offers/recommend"
    )
    const result = await recommendOffersForStudent(
      { studentUserId: "student-1", limit: 2 },
      { searchOffers: searchOffersMock },
    )

    expect(result.offers).toHaveLength(1)
    expect(result.offers[0]?.id).toBe("offer-1")
  })
})
