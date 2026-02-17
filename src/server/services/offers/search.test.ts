import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockOffersRows: any[] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockOfferSkillsRows: any[] = []

let selectCallIdx = 0

// Query 1 (offers)
const mockLimit = mock(() => Promise.resolve(mockOffersRows))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJoinCompany = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFromOffers = mock(() => ({}) as any)

// Query 2 (skills)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSkillWhere = mock<() => Promise<any[]>>(() => Promise.resolve(mockOfferSkillsRows))
const mockJoinSkill = mock(() => ({ where: mockSkillWhere }))
const mockFromSkills = mock(() => ({ innerJoin: mockJoinSkill }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      if (selectCallIdx === 1) return { from: mockFromOffers }
      return { from: mockFromSkills }
    },
  },
}))

describe("src/server/services/offers/search", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockOffersRows = []
    mockOfferSkillsRows = []

    mockLimit.mockClear()
    mockOrderBy.mockClear()
    mockWhere.mockClear()
    mockJoinCompany.mockClear()
    mockFromOffers.mockClear()

    mockSkillWhere.mockClear()
    mockJoinSkill.mockClear()
    mockFromSkills.mockClear()

    mockFromOffers.mockReturnValue({ innerJoin: mockJoinCompany })
    mockJoinCompany.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })

    mockFromSkills.mockReturnValue({ innerJoin: mockJoinSkill })
    mockJoinSkill.mockReturnValue({ where: mockSkillWhere })
  })

  test("should slice results to limit and compute nextCursor", async () => {
    const createdAt1 = new Date("2025-01-02T00:00:00.000Z")
    const createdAt2 = new Date("2025-01-01T00:00:00.000Z")

    mockOffersRows = [
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Offer 1",
        description: "Desc",
        internshipType: "pfe",
        workMode: "remote",
        wilayaCode: 16,
        durationWeeks: 12,
        maxPositions: 1,
        status: "published",
        closesAt: null,
        createdAt: createdAt1,
        companyName: "Acme",
        companySlug: "acme",
        companyLogoUrl: null,
        companyWilayaCode: 16,
      },
      {
        id: "offer-2",
        companyId: "company-2",
        title: "Offer 2",
        description: "Desc",
        internshipType: "summer",
        workMode: "hybrid",
        wilayaCode: 25,
        durationWeeks: 8,
        maxPositions: 2,
        status: "published",
        closesAt: null,
        createdAt: createdAt2,
        companyName: "Beta",
        companySlug: "beta",
        companyLogoUrl: null,
        companyWilayaCode: 25,
      },
    ]

    mockOfferSkillsRows = [
      {
        offerId: "offer-1",
        skillId: "s1",
        skillName: "React",
        skillSlug: "react",
        skillCategory: "frontend",
      },
    ]

    const { searchOffers } = await import("@/server/services/offers/search")
    const result = await searchOffers({ limit: 1 })

    expect(result.offers).toHaveLength(1)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toEqual({
      createdAt: createdAt1.toISOString(),
      id: "offer-1",
    })
    expect(result.offers[0].skills).toHaveLength(1)
    expect(result.offers[0].skills[0].name).toBe("React")
  })
})
