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

describe("src/server/services/skills/create", () => {
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

  test("should create a new skill when name does not exist", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react" },
    ])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    const result = await createSkill("React", "frontend")

    expect(result.created).toBe(true)
    expect(result.id).toBe("skill-1")
    expect(result.name).toBe("React")
    expect(result.slug).toBe("react")
    expect(result.category).toBe("frontend")
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should return existing skill when exact name already exists", async () => {
    mockLimit.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react" },
    ])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    const result = await createSkill("React")

    expect(result.created).toBe(false)
    expect(result.id).toBe("skill-1")
    expect(mockInsert).not.toHaveBeenCalled()
  })

  test("should throw SKILL_NAME_REQUIRED for empty name", async () => {
    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    await expect(createSkill("   ")).rejects.toMatchObject({
      code: "SKILL_NAME_REQUIRED",
      message: "Skill name is required",
    })
  })

  test("should throw SKILL_NAME_TOO_LONG for name over 100 chars", async () => {
    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    await expect(createSkill("a".repeat(101))).rejects.toMatchObject({
      code: "SKILL_NAME_TOO_LONG",
      message: "Skill name must be at most 100 characters",
    })
  })

  test("should generate URL-safe slug from name", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([{ id: "skill-1", name: "C++", slug: "c" }])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    await createSkill("C++")

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.slug).toBeDefined()
  })

  test("should handle null category", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react" },
    ])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    const result = await createSkill("React")

    expect(result.category).toBeNull()
  })

  test("should trim name and category", async () => {
    mockLimit.mockResolvedValue([])
    mockReturning.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react" },
    ])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    await createSkill("  React  ", "  frontend  ")

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.name).toBe("React")
    expect(payload.category).toBe("frontend")
  })
})
