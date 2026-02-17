import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockReturning = mock(() =>
  Promise.resolve([{ id: "uni-1", name: "Test Uni" }]),
)
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

mock.module("@/server/db", () => ({
  db: { update: mockUpdate },
}))

describe("rejectUniversity", () => {
  beforeEach(() => {
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ id: "uni-1", name: "Test Uni" }])
  })

  test("should return universityId and name on success", async () => {
    const { rejectUniversity } = await import("@/server/services/universities/reject")
    const result = await rejectUniversity("uni-1", "Not eligible", "admin-1")
    expect(result).toEqual({ universityId: "uni-1", name: "Test Uni" })
  })

  test("should call update with rejection data", async () => {
    const { rejectUniversity } = await import("@/server/services/universities/reject")
    await rejectUniversity("uni-1", "Incomplete docs", "admin-1")
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when university not found", async () => {
    mockReturning.mockResolvedValue([])

    const { rejectUniversity } = await import("@/server/services/universities/reject")
    expect(
      rejectUniversity("nonexistent", "reason", "admin-1"),
    ).rejects.toThrow("University not found")
  })
})
