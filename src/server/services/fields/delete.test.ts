import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectLimitQueue: unknown[][] = []

const mockLimit = mock((): any =>
  Promise.resolve(selectLimitQueue.shift() ?? []),
)
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockDeleteWhere = mock(() => Promise.resolve())
const mockDelete = mock(() => ({ where: mockDeleteWhere }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      delete: mockDelete,
    },
  }))
}

let moduleImportCounter = 0
async function loadDeleteFieldModule() {
  moduleImportCounter += 1
  return import(`@/server/services/fields/delete?test=${moduleImportCounter}`)
}

describe("deleteField", () => {
  beforeEach(() => {
    selectLimitQueue.length = 0
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockDelete.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)
  })

  test("should throw FIELD_NOT_FOUND when field does not exist", async () => {
    selectLimitQueue.push([])

    const { deleteField } = await loadDeleteFieldModule()
    await expect(deleteField("missing")).rejects.toMatchObject({
      code: "FIELD_NOT_FOUND",
      message: "Field not found",
    })
  })

  test("should throw FIELD_IN_USE when departments reference the field", async () => {
    selectLimitQueue.push([{ id: "field-1" }])
    selectLimitQueue.push([{ id: "dept-1" }])

    const { deleteField } = await loadDeleteFieldModule()
    await expect(deleteField("field-1")).rejects.toMatchObject({
      code: "FIELD_IN_USE",
      message: "Cannot delete field that is assigned to departments",
    })
  })

  test("should delete field when no departments reference it", async () => {
    selectLimitQueue.push([{ id: "field-1" }])
    selectLimitQueue.push([])

    const { deleteField } = await loadDeleteFieldModule()
    const result = await deleteField("field-1")

    expect(result).toEqual({ success: true, fieldId: "field-1" })
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })
})
