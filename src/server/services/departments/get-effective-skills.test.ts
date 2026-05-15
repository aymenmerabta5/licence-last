import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelectResults: any[][] = []
let selectCallIdx = 0

function createQuery(rows: any[]) {
  const promise = Promise.resolve(rows)
  return Object.assign(promise, {
    limit() {
      return Promise.resolve(rows)
    },
  })
}

const mockWhere = mock(() =>
  createQuery(mockSelectResults[selectCallIdx - 1] ?? []),
)
const mockFrom = mock(() => ({ where: mockWhere }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      return { from: mockFrom }
    },
  },
}))

let moduleImportCounter = 0
async function loadModule() {
  moduleImportCounter++
  return import(
    `@/server/services/departments/get-effective-skills?test=${moduleImportCounter}`
  )
}

describe("getEffectiveDepartmentSkillIds", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0
    mockWhere.mockClear()
    mockFrom.mockClear()
  })

  test("should return empty array when no categories and no overrides", async () => {
    mockSelectResults.push([], [])

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual([])
  })

  test("should return skills from department categories", async () => {
    mockSelectResults.push(
      [{ categoryId: 1 }],
      [{ id: "s1" }, { id: "s2" }],
      [],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["s1", "s2"])
  })

  test("should add override skills to baseline", async () => {
    mockSelectResults.push(
      [{ categoryId: 1 }],
      [{ id: "s1" }],
      [{ skillTagId: "s2", action: "add" }],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["s1", "s2"])
  })

  test("should remove override skills from baseline", async () => {
    mockSelectResults.push(
      [{ categoryId: 1 }],
      [{ id: "s1" }, { id: "s2" }],
      [{ skillTagId: "s2", action: "remove" }],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["s1"])
  })

  test("should handle add and remove overrides together", async () => {
    mockSelectResults.push(
      [{ categoryId: 1 }],
      [{ id: "s1" }],
      [
        { skillTagId: "s2", action: "add" },
        { skillTagId: "s1", action: "remove" },
      ],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["s2"])
  })

  test("should return override-only skills when no categories", async () => {
    mockSelectResults.push(
      [],
      [{ skillTagId: "s1", action: "add" }],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["s1"])
  })
})
