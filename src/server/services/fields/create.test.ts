import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([] as any[]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockReturning = mock(() => Promise.resolve([] as any[]))
const mockValues = mock(() => ({ returning: mockReturning }))
const mockInsert = mock(() => ({ values: mockValues }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
  }))
}

describe("src/server/services/fields/create", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockReturning.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ returning: mockReturning })
  })

  test("should create a new field when name does not exist", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([{ id: "field-1" }])

    const { createField } = await import(
      `@/server/services/fields/create?fresh=${Date.now()}`
    )

    const result = await createField("Computer Science")

    expect(result.fieldId).toBe("field-1")
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should throw FIELD_NAME_EXISTS when exact name already exists", async () => {
    mockLimit.mockResolvedValue([{ id: "field-1" }])

    const { createField } = await import(
      `@/server/services/fields/create?fresh=${Date.now()}`
    )

    await expect(createField("Computer Science")).rejects.toMatchObject({
      code: "FIELD_NAME_EXISTS",
      message: "A field with this name already exists",
    })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  test("should throw FIELD_NAME_REQUIRED for empty name", async () => {
    const { createField } = await import(
      `@/server/services/fields/create?fresh=${Date.now()}`
    )

    await expect(createField("   ")).rejects.toMatchObject({
      code: "FIELD_NAME_REQUIRED",
      message: "Field name is required",
    })
  })

  test("should throw FIELD_NAME_TOO_LONG for name over 100 chars", async () => {
    const { createField } = await import(
      `@/server/services/fields/create?fresh=${Date.now()}`
    )

    await expect(createField("a".repeat(101))).rejects.toMatchObject({
      code: "FIELD_NAME_TOO_LONG",
      message: "Field name must be at most 100 characters",
    })
  })

  test("should generate URL-safe slug from name", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([{ id: "field-1" }])

    const { createField } = await import(
      `@/server/services/fields/create?fresh=${Date.now()}`
    )

    await createField("C++ Programming")

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.slug).toBeDefined()
  })

  test("should trim name and description", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([{ id: "field-1" }])

    const { createField } = await import(
      `@/server/services/fields/create?fresh=${Date.now()}`
    )

    await createField("  Computer Science  ", "  A description  ")

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.name).toBe("Computer Science")
    expect(payload.description).toBe("A description")
  })

  test("should handle null description", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([{ id: "field-1" }])

    const { createField } = await import(
      `@/server/services/fields/create?fresh=${Date.now()}`
    )

    await createField("Computer Science")

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.description).toBeNull()
  })
})
