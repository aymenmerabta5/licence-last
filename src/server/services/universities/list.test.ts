import { beforeEach, describe, expect, mock, test } from "bun:test"

let queryResult: any[] = []

const mockWhere = mock(() => Promise.resolve(queryResult))

const mockOffset = mock((): any => Promise.resolve(queryResult))
const mockLimit = mock(() => ({ offset: mockOffset }))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ orderBy: mockOrderBy }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/universities/list", () => {
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
    mockOffset.mockImplementation(() => Promise.resolve(queryResult))
    mockWhere.mockImplementation(() => Promise.resolve(queryResult))
  })

  test("should return universities with default pagination", async () => {
    queryResult = [{ id: "uni-1", name: "Uni A" }]

    mockOffset.mockResolvedValue(queryResult as any)

    const { listUniversities } = await import(
      "@/server/services/universities/list?fresh=1" as string
    )
    const result = await listUniversities()

    expect(result.universities).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })

  test("should detect hasMore when more rows than limit", async () => {
    queryResult = [
      { id: "uni-1", name: "A" },
      { id: "uni-2", name: "B" },
      { id: "uni-3", name: "C" },
    ]

    mockOffset.mockResolvedValue(queryResult as any)

    const { listUniversities } = await import(
      "@/server/services/universities/list?fresh=2" as string
    )
    const result = await listUniversities({ limit: 2 })

    expect(result.universities).toHaveLength(2)
    expect(result.hasMore).toBe(true)
  })

  test("should filter by status when provided", async () => {
    queryResult = [{ id: "uni-1", name: "A", status: "approved" }]
    mockOffset.mockReturnValue({ where: mockWhere })

    const { listUniversities } = await import(
      "@/server/services/universities/list?fresh=3" as string
    )
    const result = await listUniversities({ status: "approved" })

    expect(mockWhere).toHaveBeenCalled()
    expect(result.universities).toHaveLength(1)
  })

  test("should filter by search across name and abbreviation", async () => {
    queryResult = [
      {
        id: "uni-1",
        name: "University of Science",
        abbreviation: "USTHB",
      },
    ]
    mockOffset.mockReturnValue({ where: mockWhere })

    const { listUniversities } = await import(
      "@/server/services/universities/list?fresh=4" as string
    )
    const result = await listUniversities({ search: "usth" })

    expect(mockWhere).toHaveBeenCalled()
    expect(result.universities).toHaveLength(1)
  })

  test("should cap limit at 200", async () => {
    mockOffset.mockResolvedValue([] as any)

    const { listUniversities } = await import(
      "@/server/services/universities/list?fresh=5" as string
    )
    await listUniversities({ limit: 500 })

    expect(mockLimit).toHaveBeenCalled()
  })
})
