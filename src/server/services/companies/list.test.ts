import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let queryResult: any[] = []

const mockWhere = mock(() => Promise.resolve(queryResult))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockOffset = mock((): any => {
  // When no status filter, result resolves directly
  return { where: mockWhere }
})
const mockLimit = mock(() => ({ offset: mockOffset }))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ orderBy: mockOrderBy }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/companies/list", () => {
  beforeEach(() => {
    queryResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockOrderBy.mockClear()
    mockLimit.mockClear()
    mockOffset.mockClear()
    mockWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
    mockLimit.mockReturnValue({ offset: mockOffset })
  })

  test("should return empty list when no companies exist", async () => {
    queryResult = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOffset.mockResolvedValue(queryResult as any)

    const { listCompanies } = await import(
      "@/server/services/companies/list?fresh=1"
    )
    const result = await listCompanies()

    expect(result.companies).toEqual([])
    expect(result.hasMore).toBe(false)
  })

  test("should indicate hasMore when more results available", async () => {
    const companies = Array.from({ length: 51 }, (_, i) => ({
      id: `company-${i}`,
      name: `Company ${i}`,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOffset.mockResolvedValue(companies as any)

    const { listCompanies } = await import(
      "@/server/services/companies/list?fresh=2"
    )
    const result = await listCompanies()

    expect(result.companies.length).toBe(50)
    expect(result.hasMore).toBe(true)
  })

  test("should respect limit parameter", async () => {
    const companies = Array.from({ length: 6 }, (_, i) => ({
      id: `company-${i}`,
      name: `Company ${i}`,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOffset.mockResolvedValue(companies as any)

    const { listCompanies } = await import(
      "@/server/services/companies/list?fresh=3"
    )
    const result = await listCompanies({ limit: 5 })

    expect(result.companies.length).toBe(5)
    expect(result.hasMore).toBe(true)
  })

  test("should cap limit at 200", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOffset.mockResolvedValue([] as any)

    const { listCompanies } = await import(
      "@/server/services/companies/list?fresh=4"
    )
    await listCompanies({ limit: 500 })

    expect(mockLimit).toHaveBeenCalled()
  })
})
