import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockOrderBy = mock((): any => [])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSkillFrom = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInnerJoin = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSkillWhere = mock((): any => [])

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/offers/list-by-company", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockOrderBy.mockClear()
    mockSkillFrom.mockClear()
    mockInnerJoin.mockClear()
    mockSkillWhere.mockClear()

    // Default: first call returns offers, second call returns skills
    let callCount = 0
    mockSelect.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { from: mockFrom }
      }
      return { from: mockSkillFrom }
    })

    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ orderBy: mockOrderBy })

    mockSkillFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockSkillWhere })
  })

  test("should return empty array for no offers", async () => {
    mockOrderBy.mockResolvedValue([])

    const { listOffersByCompany } = await import("./list-by-company")

    const result = await listOffersByCompany("company-1")

    expect(result).toEqual([])
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })

  test("should return offers with grouped skills", async () => {
    mockOrderBy.mockResolvedValue([
      { id: "offer-1", title: "Frontend Intern", companyId: "company-1" },
      { id: "offer-2", title: "Backend Intern", companyId: "company-1" },
    ])
    mockSkillWhere.mockResolvedValue([
      { offerId: "offer-1", skillId: "s1", skillName: "React", skillSlug: "react", skillCategory: "frontend" },
      { offerId: "offer-1", skillId: "s2", skillName: "TypeScript", skillSlug: "typescript", skillCategory: "languages" },
      { offerId: "offer-2", skillId: "s3", skillName: "Node.js", skillSlug: "nodejs", skillCategory: "backend" },
    ])

    const { listOffersByCompany } = await import("./list-by-company")

    const result = await listOffersByCompany("company-1")

    expect(result).toHaveLength(2)
    expect(result[0].skills).toHaveLength(2)
    expect(result[0].skills[0].name).toBe("React")
    expect(result[1].skills).toHaveLength(1)
    expect(result[1].skills[0].name).toBe("Node.js")
  })
})
