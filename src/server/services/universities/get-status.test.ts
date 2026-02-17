import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockLimitResult: any[] = []

const mockLimit = mock(() => Promise.resolve(mockLimitResult))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockInnerJoin = mock(() => ({ where: mockWhere }))
const mockFrom = mock(() => ({ innerJoin: mockInnerJoin }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/universities/get-status", () => {
  beforeEach(() => {
    mockLimitResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockInnerJoin.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("returns university status when membership exists", async () => {
    mockLimitResult = [
      {
        id: "uni-1",
        status: "approved",
        rejectionReason: null,
      },
    ]

    const { getUniversityStatusByUserId } = await import(
      "@/server/services/universities/get-status"
    )
    const result = await getUniversityStatusByUserId("user-1")

    expect(result).toEqual({
      id: "uni-1",
      status: "approved",
      rejectionReason: null,
    })
  })

  test("returns null when user has no university", async () => {
    mockLimitResult = []

    const { getUniversityStatusByUserId } = await import(
      "@/server/services/universities/get-status"
    )
    const result = await getUniversityStatusByUserId("user-2")

    expect(result).toBeNull()
  })
})

