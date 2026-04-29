import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockSelectResult: any[] = []
const mockReturning = mock(() =>
  Promise.resolve([{ id: "uni-1", name: "Test Uni" }]),
)
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))
const mockSelectLimit = mock(() => Promise.resolve(mockSelectResult))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

function applyRejectUniversityMocks() {
  mock.module("@/server/db", () => ({
    db: { select: mockSelect, update: mockUpdate },
  }))
}

let rejectUniversityImportCounter = 0
async function importRejectUniversity() {
  rejectUniversityImportCounter += 1
  return import(
    `@/server/services/universities/reject?test=${rejectUniversityImportCounter}`
  )
}

describe("rejectUniversity", () => {
  beforeEach(() => {
    applyRejectUniversityMocks()
    mockSelectResult = []

    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectWhere.mockClear()
    mockSelectLimit.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockSelect.mockReturnValue({ from: mockSelectFrom })
    mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockSelectLimit })
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ id: "uni-1", name: "Test Uni" }])
  })

  test("should return universityId and name on success", async () => {
    const { rejectUniversity } = await importRejectUniversity()
    const result = await rejectUniversity("uni-1", "Not eligible", "admin-1")
    expect(result).toEqual({ universityId: "uni-1", name: "Test Uni" })
  })

  test("should call update with rejection data", async () => {
    const { rejectUniversity } = await importRejectUniversity()
    await rejectUniversity("uni-1", "Incomplete docs", "admin-1")
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when university not found", async () => {
    mockReturning.mockResolvedValue([])
    mockSelectResult = []

    const { rejectUniversity } = await importRejectUniversity()
    expect(
      rejectUniversity("nonexistent", "reason", "admin-1"),
    ).rejects.toThrow("University not found")
  })

  test("should reject universities that are no longer pending", async () => {
    mockReturning.mockResolvedValue([])
    mockSelectResult = [{ id: "uni-1", status: "approved" }]

    const { rejectUniversity } = await importRejectUniversity()

    await expect(
      rejectUniversity("uni-1", "reason", "admin-1"),
    ).rejects.toThrow("Only pending universities can be rejected")
  })
})
