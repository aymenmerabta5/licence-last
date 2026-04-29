import { beforeEach, describe, expect, mock, test } from "bun:test"

// Mock results for executed queries (not subquery builders)
// Index 0: Main query results (offer + company + count)
// Index 1: Skills query results

const mockQueryResults: any[][] = []
let queryResultIdx = 0
let selectCallCount = 0

// Mock for the main query execution (offer + company + count)
const mockLimit = mock(() => {
  const results = mockQueryResults[queryResultIdx++] ?? []
  return Promise.resolve(results)
})

const mockWhereWithLimit = mock(() => ({ limit: mockLimit }))
const mockLeftJoinSubquery = mock(() => ({ where: mockWhereWithLimit }))
const mockInnerJoinCompany = mock(() => ({ leftJoin: mockLeftJoinSubquery }))
const mockFromWithJoins = mock(() => ({ innerJoin: mockInnerJoinCompany }))

// Mock for skills query execution

const mockSkillsWhere = mock<() => Promise<any[]>>(() => {
  const results = mockQueryResults[queryResultIdx++] ?? []
  return Promise.resolve(results)
})
const mockSkillsJoin = mock(() => ({ where: mockSkillsWhere }))
const mockFromSkills = mock(() => ({ innerJoin: mockSkillsJoin }))

// Mock for language requirements query execution

const mockLanguagesWhere = mock<() => Promise<any[]>>(() => {
  const results = mockQueryResults[queryResultIdx++] ?? []
  return Promise.resolve(results)
})
const mockFromLanguages = mock(() => ({ where: mockLanguagesWhere }))

// Mock for subquery builder (application count subquery)
// This needs to support: .select().from().where().groupBy().as()
// Note: The subquery is only BUILT, not executed - it becomes part of the main query
const mockAs = mock(() => ({ as: "app_count_subquery" }))
const mockGroupBy = mock(() => ({ as: mockAs }))
const mockSubqueryWhere = mock(() => ({ groupBy: mockGroupBy }))
const mockSubqueryFrom = mock(() => ({ where: mockSubqueryWhere }))

function applyGetOfferMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => {
        selectCallCount++
        // Call 1: Subquery builder (no execution, just building)
        // Call 2: Main query execution
        // Call 3: Skills query execution
        if (selectCallCount === 1) {
          // First call is for the subquery builder
          return { from: mockSubqueryFrom }
        }
        if (selectCallCount === 2) {
          // Second call is for the main query
          return { from: mockFromWithJoins }
        }
        // Third call is for skills
        if (selectCallCount === 3) {
          return { from: mockFromSkills }
        }
        // Fourth call is for language requirements
        return { from: mockFromLanguages }
      },
    },
  }))
}

let getOfferImportCounter = 0
async function importOfferGet() {
  getOfferImportCounter += 1
  return (await import(
    `@/server/services/offers/get?test=${getOfferImportCounter}`
  )) as typeof import("@/server/services/offers/get")
}

describe("src/server/services/offers/get", () => {
  beforeEach(() => {
    applyGetOfferMocks()

    queryResultIdx = 0
    selectCallCount = 0
    mockQueryResults.length = 0

    // Reset main query mocks
    mockLimit.mockClear()
    mockWhereWithLimit.mockClear()
    mockLeftJoinSubquery.mockClear()
    mockInnerJoinCompany.mockClear()
    mockFromWithJoins.mockClear()

    // Reset skills query mocks
    mockSkillsWhere.mockClear()
    mockSkillsJoin.mockClear()
    mockFromSkills.mockClear()

    // Reset language requirements query mocks
    mockLanguagesWhere.mockClear()
    mockFromLanguages.mockClear()

    // Reset subquery mocks
    mockAs.mockClear()
    mockGroupBy.mockClear()
    mockSubqueryWhere.mockClear()
    mockSubqueryFrom.mockClear()

    // Setup subquery chain: select().from().where().groupBy().as()
    mockSubqueryFrom.mockReturnValue({ where: mockSubqueryWhere })
    mockSubqueryWhere.mockReturnValue({ groupBy: mockGroupBy })
    mockGroupBy.mockReturnValue({ as: mockAs })

    // Setup main query chain
    mockFromWithJoins.mockReturnValue({ innerJoin: mockInnerJoinCompany })
    mockInnerJoinCompany.mockReturnValue({ leftJoin: mockLeftJoinSubquery })
    mockLeftJoinSubquery.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    // Setup skills query chain
    mockFromSkills.mockReturnValue({ innerJoin: mockSkillsJoin })
    mockSkillsJoin.mockReturnValue({ where: mockSkillsWhere })

    // Setup language requirements query chain
    mockFromLanguages.mockReturnValue({ where: mockLanguagesWhere })
  })

  test("should return offer with skills and applicationCount", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z")
    const updatedAt = new Date("2025-01-02T00:00:00.000Z")

    // Main query result (index 0)
    mockQueryResults.push([
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
        applicationCount: 3,
      },
    ])
    // Skills query result (index 1)
    mockQueryResults.push([
      { id: "s1", name: "React", slug: "react", category: "frontend" },
    ])
    // Language requirements query result (index 2)
    mockQueryResults.push([])

    const { getOfferById } = await importOfferGet()
    const result = await getOfferById("offer-1")

    expect(result?.id).toBe("offer-1")
    expect(result?.skills).toHaveLength(1)
    expect(result?.skills[0].name).toBe("React")
    expect(result?.applicationCount).toBe(3)
  })

  test("should return offer with zero applicationCount when no applications", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z")
    const updatedAt = new Date("2025-01-02T00:00:00.000Z")

    // Main query result (index 0) - null count from COALESCE
    mockQueryResults.push([
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
        applicationCount: null, // null from COALESCE when no applications
      },
    ])
    // Skills query result (index 1) - no skills
    mockQueryResults.push([])
    // Language requirements query result (index 2)
    mockQueryResults.push([])

    const { getOfferById } = await importOfferGet()
    const result = await getOfferById("offer-1")

    expect(result?.id).toBe("offer-1")
    expect(result?.skills).toHaveLength(0)
    expect(result?.applicationCount).toBe(0) // Should default to 0
  })

  test("should return offer with skills and zero count when no skills", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z")
    const updatedAt = new Date("2025-01-02T00:00:00.000Z")

    // Main query result (index 0)
    mockQueryResults.push([
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
        applicationCount: 5,
      },
    ])
    // Skills query result (index 1) - no skills
    mockQueryResults.push([])
    // Language requirements query result (index 2)
    mockQueryResults.push([])

    const { getOfferById } = await importOfferGet()
    const result = await getOfferById("offer-1")

    expect(result?.id).toBe("offer-1")
    expect(result?.skills).toHaveLength(0)
    expect(result?.applicationCount).toBe(5)
  })
})
