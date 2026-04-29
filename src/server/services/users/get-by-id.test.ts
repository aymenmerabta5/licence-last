import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      return { from: mockFrom }
    },
  },
}))

describe("src/server/services/users/get-by-id", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0
    mockLimit.mockClear()
    mockWhere.mockClear()
    mockFrom.mockClear()

    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("should return the user when it exists", async () => {
    const now = new Date()
    const mockUser = {
      id: "user-1",
      name: "John",
      email: "john@example.com",
      role: "student",
      image: null,
      universityId: null,
      createdAt: now,
    }

    mockSelectResults.push([mockUser])

    const { getUserById } = await import("@/server/services/users/get-by-id")
    const result = await getUserById("user-1")

    expect(result).toEqual({
      ...mockUser,
      rawRole: "student",
      effectiveRole: "student",
    })
  })

  test("should return null when it does not exist", async () => {
    mockSelectResults.push([])

    const { getUserById } = await import("@/server/services/users/get-by-id")
    const result = await getUserById("missing")

    expect(result).toBeNull()
  })
})
