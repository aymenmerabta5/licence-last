import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() =>
  Promise.resolve(mockSelectResults[selectCallIdx - 1] ?? []),
)
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => {
  selectCallIdx++
  return { from: mockFrom }
})

const mockReturning = mock(() => Promise.resolve([] as any[]))
const mockValues = mock(() => ({ returning: mockReturning }))
const mockInsert = mock(() => ({ values: mockValues }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}))

function applyMocks() {
  selectCallIdx = 0
  mockSelectResults.length = 0

  mockLimit.mockClear()
  mockWhere.mockClear()
  mockFrom.mockClear()
  mockSelect.mockClear()
  mockInsert.mockClear()
  mockValues.mockClear()
  mockReturning.mockClear()

  mockSelect.mockImplementation(() => {
    selectCallIdx++
    return { from: mockFrom }
  })
  mockFrom.mockReturnValue({ where: mockWhere })
  mockWhere.mockReturnValue({ limit: mockLimit })
  mockLimit.mockImplementation(() =>
    Promise.resolve(mockSelectResults[selectCallIdx - 1] ?? []),
  )
  mockInsert.mockReturnValue({ values: mockValues })
  mockValues.mockReturnValue({ returning: mockReturning })
}

describe("createSkill", () => {
  beforeEach(() => {
    applyMocks()
  })

  test("should return exists for exact match", async () => {
    mockSelectResults.push([
      { id: "skill-1", name: "React", slug: "react", categoryId: 1 },
    ])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    const result = await createSkill(
      { name: "React", categoryId: 1 },
      "user-1",
      "admin",
    )

    expect(result.status).toBe("exists")
    expect(result.skill.id).toBe("skill-1")
    expect(mockInsert).not.toHaveBeenCalled()
  })

  test("should return similar_exists for close match", async () => {
    mockSelectResults.push(
      [],
      [{ id: "skill-1", name: "Reacct", slug: "reacct", categoryId: 1 }],
    )

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    const result = await createSkill(
      { name: "Reacct", categoryId: 1 },
      "user-1",
      "admin",
    )

    expect(result.status).toBe("similar_exists")
    expect(result.similar).toHaveLength(1)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  test("should create new skill when no match", async () => {
    mockSelectResults.push([], [])
    mockReturning.mockResolvedValue([
      {
        id: "new-skill",
        name: "Quantum Computing",
        slug: "quantum-computing",
        categoryId: 1,
      },
    ])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    const result = await createSkill(
      { name: "Quantum Computing", categoryId: 1 },
      "user-1",
      "admin",
    )

    expect(result.status).toBe("created")
    expect(result.skill.id).toBe("new-skill")
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should force create when similar exists and force is true", async () => {
    mockSelectResults.push(
      [],
      [{ id: "skill-1", name: "Reacct", slug: "reacct", categoryId: 1 }],
    )
    mockReturning.mockResolvedValue([
      {
        id: "new-skill",
        name: "Reacct",
        slug: "reacct",
        categoryId: 1,
      },
    ])

    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    const result = await createSkill(
      { name: "Reacct", categoryId: 1, force: true },
      "user-1",
      "admin",
    )

    expect(result.status).toBe("created")
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should throw SKILL_NAME_REQUIRED for empty name", async () => {
    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    await expect(
      createSkill({ name: "   ", categoryId: 1 }, "user-1", "admin"),
    ).rejects.toMatchObject({
      code: "SKILL_NAME_REQUIRED",
      message: "Skill name is required",
    })
  })

  test("should throw SKILL_NAME_TOO_LONG for name over 100 chars", async () => {
    const { createSkill } = await import(
      `@/server/services/skills/create?fresh=${Date.now()}`
    )

    await expect(
      createSkill({ name: "a".repeat(101), categoryId: 1 }, "user-1", "admin"),
    ).rejects.toMatchObject({
      code: "SKILL_NAME_TOO_LONG",
      message: "Skill name must be at most 100 characters",
    })
  })
})
