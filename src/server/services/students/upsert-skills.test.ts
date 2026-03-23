import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockDelete = mock(() => ({}))
const mockDeleteWhere = mock(() => Promise.resolve())
const mockInsert = mock(() => ({}))
const mockValues = mock(() => Promise.resolve())

const mockTx = {
  delete: mockDelete,
  insert: mockInsert,
}

const mockTransaction = mock(
  async (fn: (tx: typeof mockTx) => Promise<void>) => {
    await fn(mockTx)
  },
)

const mockValidateSkillTagIds = mock(() => Promise.resolve())
let importCounter = 0

mock.module("@/server/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}))

mock.module("@/server/services/skills/validate", () => ({
  validateSkillTagIds: mockValidateSkillTagIds,
}))

describe("src/server/services/students/upsert-skills", () => {
  beforeEach(() => {
    mockTransaction.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockValidateSkillTagIds.mockClear()

    mockDelete.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should replace student skills", async () => {
    const { upsertStudentSkills } = await import(
      `@/server/services/students/upsert-skills?test=${++importCounter}`
    )

    const result = await upsertStudentSkills(["skill-1", "skill-2"], "user-1")

    expect(result).toEqual({ userId: "user-1" })
    expect(mockValidateSkillTagIds).toHaveBeenCalledWith(["skill-1", "skill-2"])
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
  })

  test("should reject more than 10 skills", async () => {
    const { upsertStudentSkills } = await import(
      `@/server/services/students/upsert-skills?test=${++importCounter}`
    )

    await expect(
      upsertStudentSkills(
        Array.from({ length: 11 }, (_, index) => `skill-${index}`),
        "user-1",
      ),
    ).rejects.toThrow("A maximum of 10 skills is allowed")
  })
})
