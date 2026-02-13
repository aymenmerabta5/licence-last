import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockReturningResult: any[] = []

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

mock.module("@/server/db", () => ({
  db: {
    update: mockUpdate,
  },
}))

describe("src/server/services/users/promote", () => {
  beforeEach(() => {
    mockReturningResult = []
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should promote user and return updated data", async () => {
    mockReturningResult = [{ id: "user-1", email: "test@example.com", role: "university_admin" }]

    const { promoteUser } = await import("./promote")
    const result = await promoteUser("user-1", "university_admin")

    expect(result).toEqual({ id: "user-1", email: "test@example.com", role: "university_admin" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when user not found", async () => {
    mockReturningResult = []

    const { promoteUser } = await import("./promote")

    await expect(promoteUser("missing", "university_admin")).rejects.toThrow("User not found")
  })

  test("should accept all valid role values", async () => {
    const roles = ["student", "company_admin", "university_admin", "super_admin"] as const

    const { promoteUser } = await import("./promote")

    for (const role of roles) {
      mockReturningResult = [{ id: "user-1", email: "test@example.com", role }]
      const result = await promoteUser("user-1", role)
      expect(result.role).toBe(role)
    }
  })
})
