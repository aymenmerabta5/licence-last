import { describe, test, expect, mock, beforeEach } from "bun:test"

// Mock transaction internals
const mockSelect = mock(() => ({}))
const mockFrom = mock(() => ({}))
const mockSelectWhere = mock(() => ({}))
const mockLimit = mock(() => Promise.resolve([]))

const mockInsert = mock(() => ({}))
const mockValues = mock(() => ({}))
const mockOnConflictDoUpdate = mock(() => Promise.resolve())
const mockDelete = mock(() => ({}))
const mockDeleteWhere = mock(() => Promise.resolve())
const mockUpdate = mock(() => ({}))
const mockSet = mock(() => ({}))
const mockUpdateWhere = mock(() => Promise.resolve())

const mockTx = {
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  update: mockUpdate,
}

const mockTransaction = mock(async (fn: (tx: typeof mockTx) => Promise<void>) => {
  await fn(mockTx)
})

mock.module("@/server/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}))

describe("src/server/services/students/upsert-profile", () => {
  beforeEach(() => {
    mockTransaction.mockClear()
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockLimit.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockOnConflictDoUpdate.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()

    // Reset mock chain
    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })
    mockLimit.mockResolvedValue([])

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
    mockOnConflictDoUpdate.mockResolvedValue(undefined)
    mockDelete.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)

    mockTransaction.mockImplementation(async (fn) => {
      await fn(mockTx)
    })
  })

  test("should create profile, skills, and set onboardingCompleted", async () => {
    const { upsertStudentProfile } = await import("./upsert-profile")

    const result = await upsertStudentProfile(
      { bio: "Hello", phone: "0555" },
      ["skill-1", "skill-2"],
      "user-1",
    )

    expect(result).toEqual({ userId: "user-1" })
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    // insert called for profile and skills
    expect(mockInsert).toHaveBeenCalled()
    // delete called for existing skills
    expect(mockDelete).toHaveBeenCalled()
    // update called for onboardingCompleted
    expect(mockUpdate).toHaveBeenCalled()
  })

  test("should throw if skillTagIds.length > 10", async () => {
    const { upsertStudentProfile } = await import("./upsert-profile")

    const tooManySkills = Array.from({ length: 11 }, (_, i) => `skill-${i}`)

    expect(
      upsertStudentProfile({ bio: "test" }, tooManySkills, "user-1"),
    ).rejects.toThrow("A maximum of 10 skills is allowed")
  })

  test("should replace existing skills on update (delete + insert)", async () => {
    const { upsertStudentProfile } = await import("./upsert-profile")

    await upsertStudentProfile(
      { bio: "Updated" },
      ["skill-3"],
      "user-1",
    )

    // Delete existing skills should be called
    expect(mockDelete).toHaveBeenCalled()
    // Insert new skill should be called (profile + skills)
    expect(mockInsert).toHaveBeenCalled()
  })
})
