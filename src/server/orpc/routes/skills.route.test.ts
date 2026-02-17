import { beforeEach, describe, expect, mock, test } from "bun:test"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const listSkillTagsMock = mock(async () => ({ items: [] }))
const listSkillTagsPrioritizedMock = mock(async () => ({ items: [] }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  publicProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/skills/list", () => ({
  listSkillTags: listSkillTagsMock,
}))
mock.module("@/server/services/skills/list-prioritized", () => ({
  listSkillTagsPrioritized: listSkillTagsPrioritizedMock,
}))

describe("src/server/orpc/routes/skills", () => {
  beforeEach(() => {
    listSkillTagsMock.mockClear()
    listSkillTagsPrioritizedMock.mockClear()
  })

  test("listSkillTagsProcedure delegates with optional filters", async () => {
    const { listSkillTagsProcedure } = await import("@/server/orpc/routes/skills")

    const input = { category: "frontend", departmentId: "dep-1", limit: 25, offset: 0 }
    const result = await callProcedure(listSkillTagsProcedure, { input })

    expect(result).toEqual({ items: [] })
    expect(listSkillTagsMock).toHaveBeenCalledWith(input)
  })

  test("listSkillTagsPrioritizedProcedure delegates with department id", async () => {
    const { listSkillTagsPrioritizedProcedure } = await import("@/server/orpc/routes/skills")

    const result = await callProcedure(listSkillTagsPrioritizedProcedure, {
      input: { departmentId: "dep-1" },
    })

    expect(result).toEqual({ items: [] })
    expect(listSkillTagsPrioritizedMock).toHaveBeenCalledWith("dep-1")
  })
})
