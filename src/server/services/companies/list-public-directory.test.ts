import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockRows: any[] = []
let selectCallIndex = 0

const mockSubqueryAs = mock(() => ({}))
const mockSubqueryGroupBy = mock(() => ({ as: mockSubqueryAs }))
const mockSubqueryWhere = mock(() => ({ groupBy: mockSubqueryGroupBy }))
const mockSubqueryFrom = mock(() => ({ where: mockSubqueryWhere }))

const mockMainLimit = mock(() => Promise.resolve(mockRows))
const mockMainOrderBy = mock(() => ({ limit: mockMainLimit }))
const mockMainWhere = mock(() => ({ orderBy: mockMainOrderBy }))
const mockMainInnerJoin = mock(() => ({ where: mockMainWhere }))
const mockMainFrom = mock(() => ({ innerJoin: mockMainInnerJoin }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIndex += 1
      if (selectCallIndex === 1) {
        return { from: mockSubqueryFrom }
      }

      return { from: mockMainFrom }
    },
  },
}))

describe("src/server/services/companies/list-public-directory", () => {
  beforeEach(() => {
    selectCallIndex = 0
    mockRows = []

    mockSubqueryAs.mockClear()
    mockSubqueryGroupBy.mockClear()
    mockSubqueryWhere.mockClear()
    mockSubqueryFrom.mockClear()
    mockMainLimit.mockClear()
    mockMainOrderBy.mockClear()
    mockMainWhere.mockClear()
    mockMainInnerJoin.mockClear()
    mockMainFrom.mockClear()

    mockSubqueryFrom.mockReturnValue({ where: mockSubqueryWhere })
    mockSubqueryWhere.mockReturnValue({ groupBy: mockSubqueryGroupBy })
    mockSubqueryGroupBy.mockReturnValue({ as: mockSubqueryAs })
    mockMainFrom.mockReturnValue({ innerJoin: mockMainInnerJoin })
    mockMainInnerJoin.mockReturnValue({ where: mockMainWhere })
    mockMainWhere.mockReturnValue({ orderBy: mockMainOrderBy })
    mockMainOrderBy.mockReturnValue({ limit: mockMainLimit })
  })

  test("should return paginated companies with next cursor", async () => {
    const createdAt1 = new Date("2026-01-10T10:00:00.000Z")
    const createdAt2 = new Date("2026-01-08T10:00:00.000Z")
    mockRows = [
      {
        id: "company-1",
        name: "Acme",
        slug: "acme",
        description: "Acme company",
        logoUrl: null,
        websiteUrl: null,
        wilayaCode: 16,
        createdAt: createdAt1,
        openOffersCount: 3,
      },
      {
        id: "company-2",
        name: "Beta",
        slug: "beta",
        description: null,
        logoUrl: null,
        websiteUrl: null,
        wilayaCode: 31,
        createdAt: createdAt2,
        openOffersCount: 1,
      },
    ]

    const { listPublicDirectoryCompanies } = await import(
      "@/server/services/companies/list-public-directory?fresh=1" as string
    )

    const result = await listPublicDirectoryCompanies({ limit: 1 })

    expect(result.companies).toHaveLength(1)
    expect(result.companies[0]?.openOffersCount).toBe(3)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toEqual({
      createdAt: createdAt1.toISOString(),
      id: "company-1",
    })
    expect(mockMainLimit).toHaveBeenCalledWith(2)
  })

  test("should return empty result without next cursor", async () => {
    mockRows = []

    const { listPublicDirectoryCompanies } = await import(
      "@/server/services/companies/list-public-directory?fresh=2" as string
    )

    const result = await listPublicDirectoryCompanies({ limit: 12 })

    expect(result.companies).toEqual([])
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeUndefined()
  })
})
