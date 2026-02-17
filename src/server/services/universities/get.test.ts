import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockChain: any = {
  select: mock(() => mockChain),
  from: mock(() => mockChain),
  where: mock(() => mockChain),
  limit: mock(() => Promise.resolve([])),
  innerJoin: mock(() => mockChain),
}

mock.module("@/server/db", () => ({ db: mockChain }))

// Mock cache utilities
mock.module("@/lib/cache", () => ({
  CACHE_TAGS: { UNIVERSITIES: "universities" },
  CACHE_PROFILES: { STATIC: () => {} },
}))

describe("getUniversityById", () => {
  beforeEach(() => {
    for (const fn of Object.values(mockChain)) (fn as ReturnType<typeof mock>).mockClear()
    mockChain.select.mockReturnValue(mockChain)
    mockChain.from.mockReturnValue(mockChain)
    mockChain.where.mockReturnValue(mockChain)
    mockChain.innerJoin.mockReturnValue(mockChain)
  })

  test("should return university when found", async () => {
    const uni = { id: "uni-1", name: "Test Uni", status: "approved" }
    mockChain.limit.mockResolvedValue([uni])

    const { getUniversityById } = await import("@/server/services/universities/get")
    const result = await getUniversityById("uni-1")
    expect(result).toEqual(uni as typeof result)
  })

  test("should return null when not found", async () => {
    mockChain.limit.mockResolvedValue([])

    const { getUniversityById } = await import("@/server/services/universities/get")
    const result = await getUniversityById("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getUniversityByUserId", () => {
  beforeEach(() => {
    for (const fn of Object.values(mockChain)) (fn as ReturnType<typeof mock>).mockClear()
    mockChain.select.mockReturnValue(mockChain)
    mockChain.from.mockReturnValue(mockChain)
    mockChain.where.mockReturnValue(mockChain)
    mockChain.innerJoin.mockReturnValue(mockChain)
  })

  test("should return university data when user has university", async () => {
    const uniData = { id: "uni-1", name: "Test Uni", abbreviation: "TU", city: "Algiers", status: "approved" as const, rejectionReason: null }
    mockChain.limit.mockResolvedValue([uniData])

    const { getUniversityByUserId } = await import("@/server/services/universities/get")
    const result = await getUniversityByUserId("user-1")
    expect(result).toEqual(uniData as typeof result)
  })

  test("should return null when user has no university", async () => {
    mockChain.limit.mockResolvedValue([])

    const { getUniversityByUserId } = await import("@/server/services/universities/get")
    const result = await getUniversityByUserId("user-no-uni")
    expect(result).toBeNull()
  })
})
