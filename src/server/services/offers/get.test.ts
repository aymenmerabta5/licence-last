import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})

const mockWhereWithLimit = mock(() => ({ limit: mockLimit }))
const mockJoinCompany = mock(() => ({ where: mockWhereWithLimit }))
const mockFromWithJoin = mock(() => ({ innerJoin: mockJoinCompany }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSkillsWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockSkillsJoin = mock(() => ({ where: mockSkillsWhere }))
const mockFromSkills = mock(() => ({ innerJoin: mockSkillsJoin }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCountWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromCount = mock(() => ({ where: mockCountWhere }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      // Call 1: offer + company (limit)
      // Call 2: skills join (no limit)
      // Call 3: application count (no limit)
      if (selectCallIdx === 1) return { from: mockFromWithJoin }
      if (selectCallIdx === 2) return { from: mockFromSkills }
      return { from: mockFromCount }
    },
  },
}))

describe("src/server/services/offers/get", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockWhereWithLimit.mockClear()
    mockJoinCompany.mockClear()
    mockFromWithJoin.mockClear()

    mockSkillsWhere.mockClear()
    mockSkillsJoin.mockClear()
    mockFromSkills.mockClear()

    mockCountWhere.mockClear()
    mockFromCount.mockClear()

    mockFromWithJoin.mockReturnValue({ innerJoin: mockJoinCompany })
    mockJoinCompany.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    mockFromSkills.mockReturnValue({ innerJoin: mockSkillsJoin })
    mockSkillsJoin.mockReturnValue({ where: mockSkillsWhere })

    mockFromCount.mockReturnValue({ where: mockCountWhere })
  })

  test("should return offer with skills and applicationCount", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z")
    const updatedAt = new Date("2025-01-02T00:00:00.000Z")

    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Offer 1",
        description: "Desc",
        internshipType: "pfe",
        workMode: "remote",
        wilayaCode: 16,
        durationWeeks: 12,
        maxPositions: 2,
        status: "published",
        publishedAt: createdAt,
        closesAt: null,
        createdAt,
        updatedAt,
        companyName: "Acme",
        companySlug: "acme",
        companyLogoUrl: null,
        companyDescription: null,
        companyWilayaCode: 16,
        companyAddress: null,
      },
    ])
    mockSelectResults.push([
      { id: "s1", name: "React", slug: "react", category: "frontend" },
    ])
    mockSelectResults.push([{ value: 3 }])

    const { getOfferById } = await import("./get")
    const result = await getOfferById("offer-1")

    expect(result?.id).toBe("offer-1")
    expect(result?.skills).toHaveLength(1)
    expect(result?.skills[0].name).toBe("React")
    expect(result?.applicationCount).toBe(3)
  })
})
