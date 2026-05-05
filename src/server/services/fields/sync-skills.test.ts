import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockTxDeleteWhere = mock(() => Promise.resolve())
const mockTxDelete = mock(() => ({ where: mockTxDeleteWhere }))

const mockTxValues = mock(() => Promise.resolve())
const mockTxInsert = mock(() => ({ values: mockTxValues }))

const mockTransaction = mock(
  async (
    callback: (tx: {
      delete: typeof mockTxDelete
      insert: typeof mockTxInsert
    }) => Promise<unknown>,
  ) =>
    callback({
      delete: mockTxDelete,
      insert: mockTxInsert,
    }),
)

const mockValidateSkillTagIds = mock(() => Promise.resolve())

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      transaction: mockTransaction,
    },
  }))
  mock.module("@/server/services/skills/validate", () => ({
    validateSkillTagIds: mockValidateSkillTagIds,
  }))
}

let moduleImportCounter = 0
async function loadSyncSkillsModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/fields/sync-skills?test=${moduleImportCounter}`
  )
}

describe("syncFieldSkills", () => {
  beforeEach(() => {
    applyMocks()

    mockTransaction.mockClear()
    mockTxDelete.mockClear()
    mockTxDeleteWhere.mockClear()
    mockTxInsert.mockClear()
    mockTxValues.mockClear()
    mockValidateSkillTagIds.mockClear()

    mockTxDelete.mockReturnValue({ where: mockTxDeleteWhere })
    mockTxDeleteWhere.mockResolvedValue(undefined)
    mockTxInsert.mockReturnValue({ values: mockTxValues })
    mockTxValues.mockResolvedValue(undefined)
  })

  test("should sync skills for field", async () => {
    const { syncFieldSkills } = await loadSyncSkillsModule()
    const result = await syncFieldSkills("field-1", [
      { skillTagId: "s1", isCore: true },
      { skillTagId: "s2" },
    ])

    expect(result).toEqual({ fieldId: "field-1", skillCount: 2 })
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxDelete).toHaveBeenCalledTimes(1)
    expect(mockTxInsert).toHaveBeenCalledTimes(1)
    expect(mockValidateSkillTagIds).toHaveBeenCalledTimes(1)
  })

  test("should handle empty skills array", async () => {
    const { syncFieldSkills } = await loadSyncSkillsModule()
    const result = await syncFieldSkills("field-1", [])

    expect(result).toEqual({ fieldId: "field-1", skillCount: 0 })
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxDelete).toHaveBeenCalledTimes(1)
    expect(mockTxInsert).not.toHaveBeenCalled()
    expect(mockValidateSkillTagIds).not.toHaveBeenCalled()
  })

  test("should default isCore to false", async () => {
    const { syncFieldSkills } = await loadSyncSkillsModule()
    await syncFieldSkills("field-1", [{ skillTagId: "s1" }])

    const payload = (
      mockTxValues.mock.calls[0] as unknown as [
        Array<Record<string, unknown>>,
      ]
    )[0]
    expect(payload[0].isCore).toBe(false)
  })

  test("should throw SKILL_LIMIT_EXCEEDED for more than 200 skills", async () => {
    const { syncFieldSkills } = await loadSyncSkillsModule()
    await expect(
      syncFieldSkills(
        "field-1",
        Array(201).fill({ skillTagId: "s1" }),
      ),
    ).rejects.toMatchObject({
      code: "SKILL_LIMIT_EXCEEDED",
      message: "A maximum of 200 skills per field is allowed",
    })
  })
})
