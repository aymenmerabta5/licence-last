import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([] as any[]))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

function applyMocks() {
  mock.module("next/cache", () => ({
    cacheLife: mock(() => {}),
    cacheTag: mock(() => {}),
  }))

  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

describe("src/server/services/offers/list-public-by-company", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
  })

  test("should return public offers for a company", async () => {
    const offers = [
      {
        id: "offer-1",
        title: "Frontend Intern",
        internshipType: "pfe",
        workMode: "remote",
        wilayaCode: 16,
        maxPositions: 2,
        createdAt: new Date(),
        applicationDeadlineAt: null,
      },
    ]
    mockLimit.mockResolvedValue(offers)

    const { listPublicOffersByCompany } = await import(
      `@/server/services/offers/list-public-by-company?fresh=${Date.now()}`
    )

    const result = await listPublicOffersByCompany("company-1")

    expect(result).toEqual(offers)
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })

  test("should clamp limit between 1 and 24", async () => {
    mockLimit.mockResolvedValue([])

    const { listPublicOffersByCompany } = await import(
      `@/server/services/offers/list-public-by-company?fresh=${Date.now()}`
    )

    await listPublicOffersByCompany("company-1", 0)
    expect(mockLimit).toHaveBeenCalledWith(1)

    await listPublicOffersByCompany("company-1", 50)
    expect(mockLimit).toHaveBeenCalledWith(24)

    await listPublicOffersByCompany("company-1", 6)
    expect(mockLimit).toHaveBeenCalledWith(6)
  })
})
