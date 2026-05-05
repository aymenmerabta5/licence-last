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

const mockWhere = mock(() => createQuery(mockSelectResults[selectCallIdx - 1] ?? []))
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

  test("should return all department skills in legacy mode (no fieldId)", async () => {
    mockSelectResults.push(
      [{ fieldId: null }],
      [{ skillTagId: "s1" }, { skillTagId: "s2" }],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["s1", "s2"])
  })

  test("should return empty array in legacy mode when no skills", async () => {
    mockSelectResults.push([{ fieldId: null }], [])

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual([])
  })

  test("should compute effective skills in template mode", async () => {
    mockSelectResults.push(
      [{ fieldId: "f1" }],
      [{ skillTagId: "s1" }, { skillTagId: "s2" }],
      [{ skillTagId: "s3" }],
      [{ skillTagId: "s2" }],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["s1", "s3"])
  })

  test("should sort result alphabetically", async () => {
    mockSelectResults.push(
      [{ fieldId: null }],
      [{ skillTagId: "b" }, { skillTagId: "a" }],
    )

    const { getEffectiveDepartmentSkillIds } = await loadModule()
    const result = await getEffectiveDepartmentSkillIds("dept-1")

    expect(result).toEqual(["a", "b"])
  })
})
