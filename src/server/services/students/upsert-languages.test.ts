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

mock.module("@/server/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}))

describe("src/server/services/students/upsert-languages", () => {
  beforeEach(() => {
    mockTransaction.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()

    mockDelete.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should replace student languages", async () => {
    const { upsertStudentLanguages } = await import(
      "@/server/services/students/upsert-languages"
    )

    const result = await upsertStudentLanguages(
      [{ languageCode: "EN", proficiency: "b2" }],
      "user-1",
    )

    expect(result).toEqual({ userId: "user-1" })
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
    expect(mockValues).toHaveBeenCalledWith([
      { userId: "user-1", languageCode: "en", proficiency: "b2" },
    ])
  })

  test("should reject duplicate languages", async () => {
    const { upsertStudentLanguages } = await import(
      "@/server/services/students/upsert-languages"
    )

    await expect(
      upsertStudentLanguages(
        [
          { languageCode: "en", proficiency: "b2" },
          { languageCode: "EN", proficiency: "c1" },
        ],
        "user-1",
      ),
    ).rejects.toThrow("Duplicate languages are not allowed")
  })
})
