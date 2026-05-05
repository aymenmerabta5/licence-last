import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockReturningResult: any[] = []
let mockSelectLimitResult: any[] = []

const mockSelectLimit = mock(() => Promise.resolve(mockSelectLimitResult))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

let moduleImportCounter = 0

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      update: mockUpdate,
    },
  }))
}

async function loadUpdateFieldModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/fields/update?test=${moduleImportCounter}`
  )
}

describe("updateField", () => {
  beforeEach(() => {
    applyMocks()
    mockReturningResult = [
      { id: "field-1", name: "Old Name", slug: "old-name", description: null },
    ]
    mockSelectLimitResult = []

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
    mockReturning.mockImplementation(() =>
      Promise.resolve(mockReturningResult),
    )
  })

  test("should update name when provided", async () => {
    const { updateField } = await loadUpdateFieldModule()
    const result = await updateField("field-1", { name: "New Name" })

    expect(result.name).toBe("Old Name")
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should return existing field without DB update when no updates provided", async () => {
    mockSelectLimitResult = [
      {
        id: "field-1",
        name: "Same Name",
        slug: "same-name",
        description: null,
      },
    ]

    const { updateField } = await loadUpdateFieldModule()
    const result = await updateField("field-1", {})

    expect(result.id).toBe("field-1")
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should throw FIELD_NOT_FOUND when field does not exist for no-op", async () => {
    mockSelectLimitResult = []

    const { updateField } = await loadUpdateFieldModule()
    await expect(updateField("missing", {})).rejects.toMatchObject({
      code: "FIELD_NOT_FOUND",
      message: "Field not found",
    })
  })

  test("should throw FIELD_NOT_FOUND when update affects no rows", async () => {
    mockReturningResult = []

    const { updateField } = await loadUpdateFieldModule()
    await expect(
      updateField("missing", { name: "New Name" }),
    ).rejects.toMatchObject({
      code: "FIELD_NOT_FOUND",
      message: "Field not found",
    })
  })

  test("should throw FIELD_NAME_EXISTS when name taken by another field", async () => {
    mockSelectLimitResult = [{ id: "other-field" }]

    const { updateField } = await loadUpdateFieldModule()
    await expect(updateField("field-1", { name: "Taken" })).rejects.toMatchObject(
      {
        code: "FIELD_NAME_EXISTS",
        message: "A field with this name already exists",
      },
    )
  })

  test("should throw FIELD_NAME_REQUIRED for empty name", async () => {
    const { updateField } = await loadUpdateFieldModule()
    await expect(updateField("field-1", { name: "   " })).rejects.toMatchObject({
      code: "FIELD_NAME_REQUIRED",
      message: "Field name is required",
    })
  })

  test("should throw FIELD_NAME_TOO_LONG for name over 100 chars", async () => {
    const { updateField } = await loadUpdateFieldModule()
    await expect(
      updateField("field-1", { name: "a".repeat(101) }),
    ).rejects.toMatchObject({
      code: "FIELD_NAME_TOO_LONG",
      message: "Field name must be at most 100 characters",
    })
  })

  test("should update description when provided", async () => {
    const { updateField } = await loadUpdateFieldModule()
    const result = await updateField("field-1", { description: "New desc" })

    expect(result.name).toBe("Old Name")
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })
})
