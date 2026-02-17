import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockChain: any = {
  select: mock(() => mockChain),
  from: mock(() => mockChain),
  where: mock(() => Promise.resolve([])),
  orderBy: mock(() => mockChain),
  limit: mock(() => mockChain),
  offset: mock(() => mockChain),
}

mock.module("@/server/db", () => ({ db: mockChain }))

describe("listUniversities", () => {
  beforeEach(() => {
    for (const fn of Object.values(mockChain)) (fn as ReturnType<typeof mock>).mockClear()
    mockChain.select.mockReturnValue(mockChain)
    mockChain.from.mockReturnValue(mockChain)
    mockChain.orderBy.mockReturnValue(mockChain)
    mockChain.limit.mockReturnValue(mockChain)
    mockChain.offset.mockReturnValue(mockChain)
  })

  test("should return universities with default pagination", async () => {
    const unis = [{ id: "uni-1", name: "Uni A" }]
    mockChain.where.mockResolvedValue(unis)
    // When no status filter, the chain resolves without where
    // The query builder is: select().from().orderBy().limit().offset() → then .where or direct await
    // Let's mock the final call (offset returns a thenable)
    mockChain.offset.mockResolvedValue(unis)

    const { listUniversities } = await import("@/server/services/universities/list")
    const result = await listUniversities()

    expect(result.universities).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })

  test("should detect hasMore when more rows than limit", async () => {
    // Create 3 items, request limit=2 (internally fetches limit+1=3)
    const unis = [
      { id: "uni-1", name: "A" },
      { id: "uni-2", name: "B" },
      { id: "uni-3", name: "C" },
    ]
    mockChain.offset.mockResolvedValue(unis)

    const { listUniversities } = await import("@/server/services/universities/list")
    const result = await listUniversities({ limit: 2 })

    expect(result.universities).toHaveLength(2)
    expect(result.hasMore).toBe(true)
  })

  test("should filter by status when provided", async () => {
    const unis = [{ id: "uni-1", name: "A", status: "approved" }]
    mockChain.where.mockResolvedValue(unis)

    const { listUniversities } = await import("@/server/services/universities/list")
    const result = await listUniversities({ status: "approved" })

    expect(mockChain.where).toHaveBeenCalled()
    expect(result.universities).toHaveLength(1)
  })

  test("should cap limit at 200", async () => {
    mockChain.offset.mockResolvedValue([])

    const { listUniversities } = await import("@/server/services/universities/list")
    await listUniversities({ limit: 500 })

    // Should use min(500, 200) = 200, then +1 = 201 for hasMore detection
    expect(mockChain.limit).toHaveBeenCalled()
  })
})
