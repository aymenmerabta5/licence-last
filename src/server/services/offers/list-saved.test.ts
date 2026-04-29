import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelect = mock(() => ({}) as any)

// First query chain

const mockSavedFrom = mock(() => ({}) as any)

const mockSavedInnerJoinOffer = mock(() => ({}) as any)

const mockSavedInnerJoinCompany = mock(() => ({}) as any)

const mockSavedWhere = mock(() => ({}) as any)

const mockSavedOrderBy = mock(() => ({}) as any)

const mockSavedLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))

// Second query chain

const mockSkillsFrom = mock(() => ({}) as any)

const mockSkillsInnerJoin = mock(() => ({}) as any)

const mockSkillsWhere = mock<() => Promise<any[]>>(() => Promise.resolve([]))

function applyListSavedMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

let listSavedImportCounter = 0
async function importListSaved() {
  listSavedImportCounter += 1
  return (await import(
    `@/server/services/offers/list-saved?test=${listSavedImportCounter}`
  )) as typeof import("@/server/services/offers/list-saved")
}

describe("src/server/services/offers/list-saved", () => {
  beforeEach(() => {
    applyListSavedMocks()

    mockSelect.mockClear()
    mockSavedFrom.mockClear()
    mockSavedInnerJoinOffer.mockClear()
    mockSavedInnerJoinCompany.mockClear()
    mockSavedWhere.mockClear()
    mockSavedOrderBy.mockClear()
    mockSavedLimit.mockClear()
    mockSkillsFrom.mockClear()
    mockSkillsInnerJoin.mockClear()
    mockSkillsWhere.mockClear()

    let selectCallCount = 0
    mockSelect.mockImplementation(() => {
      selectCallCount += 1
      if (selectCallCount === 1) {
        return { from: mockSavedFrom }
      }
      return { from: mockSkillsFrom }
    })

    mockSavedFrom.mockReturnValue({ innerJoin: mockSavedInnerJoinOffer })
    mockSavedInnerJoinOffer.mockReturnValue({
      innerJoin: mockSavedInnerJoinCompany,
    })
    mockSavedInnerJoinCompany.mockReturnValue({ where: mockSavedWhere })
    mockSavedWhere.mockReturnValue({ orderBy: mockSavedOrderBy })
    mockSavedOrderBy.mockReturnValue({ limit: mockSavedLimit })

    mockSkillsFrom.mockReturnValue({ innerJoin: mockSkillsInnerJoin })
    mockSkillsInnerJoin.mockReturnValue({ where: mockSkillsWhere })
  })

  test("returns empty result when no saved offers exist", async () => {
    mockSavedLimit.mockResolvedValue([])

    const { listSavedOffers } = await importListSaved()
    const result = await listSavedOffers("student-1")

    expect(result).toEqual({
      offers: [],
      nextCursor: undefined,
      hasMore: false,
    })
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })

  test("returns paginated saved offers with skills", async () => {
    const now = new Date("2026-02-18T10:00:00.000Z")
    mockSavedLimit.mockResolvedValue([
      {
        offerId: "offer-2",
        savedAt: now,
        title: "Offer 2",
        description: "Desc 2",
        internshipType: "pfe",
        workMode: "hybrid",
        wilayaCode: 16,
        durationWeeks: 12,
        maxPositions: 2,
        status: "published",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
        closesAt: null,
        createdAt: now,
        companyId: "company-1",
        companyName: "Acme",
        companySlug: "acme",
        companyLogoUrl: null,
        companyWilayaCode: 16,
      },
      {
        offerId: "offer-1",
        savedAt: new Date("2026-02-17T10:00:00.000Z"),
        title: "Offer 1",
        description: "Desc 1",
        internshipType: "summer",
        workMode: "remote",
        wilayaCode: 31,
        durationWeeks: 8,
        maxPositions: 1,
        status: "published",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
        closesAt: null,
        createdAt: now,
        companyId: "company-2",
        companyName: "Beta",
        companySlug: "beta",
        companyLogoUrl: null,
        companyWilayaCode: 31,
      },
    ])
    mockSkillsWhere.mockResolvedValue([
      {
        offerId: "offer-2",
        skillId: "skill-1",
        skillName: "TypeScript",
        skillSlug: "typescript",
        skillCategory: "languages",
      },
    ])

    const { listSavedOffers } = await importListSaved()
    const result = await listSavedOffers("student-1", { limit: 1 })

    expect(result.offers).toHaveLength(1)
    expect(result.offers[0]?.offerId).toBe("offer-2")
    expect(result.offers[0]?.skills).toEqual([
      {
        id: "skill-1",
        name: "TypeScript",
        slug: "typescript",
        category: "languages",
      },
    ])
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toEqual({
      savedAt: now.toISOString(),
      offerId: "offer-2",
    })
  })
})
