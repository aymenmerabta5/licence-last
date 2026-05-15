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
const createSkillMock = mock(async () => ({
  status: "created" as const,
  skill: { id: "skill-1", name: "Test", slug: "test" },
}))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  universityProcedureAssistant: createProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([{ id: 1 }]),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: 1 }]),
      }),
    }),
  },
}))

mock.module("@/server/services/skills/list", () => ({
  listSkillTags: listSkillTagsMock,
}))
mock.module("@/server/services/skills/list-prioritized", () => ({
  listSkillTagsPrioritized: listSkillTagsPrioritizedMock,
}))
mock.module("@/server/services/skills/create", () => ({
  createSkill: createSkillMock,
}))

describe("src/server/orpc/routes/skills", () => {
  beforeEach(() => {
    listSkillTagsMock.mockClear()
    listSkillTagsPrioritizedMock.mockClear()
    createSkillMock.mockClear()
  })

  test("listSkillTagsProcedure delegates with optional filters", async () => {
    const { listSkillTagsProcedure } = await import(
      "@/server/orpc/routes/skills"
    )

    const input = {
      categoryId: 1,
      status: "active",
      limit: 25,
      offset: 0,
    }
    const result = await callProcedure(listSkillTagsProcedure, { input })

    expect(result).toEqual({ items: [] })
    expect(listSkillTagsMock).toHaveBeenCalledWith(input)
  })

  test("listSkillTagsPrioritizedProcedure delegates with department id", async () => {
    const { listSkillTagsPrioritizedProcedure } = await import(
      "@/server/orpc/routes/skills"
    )

    const result = await callProcedure(listSkillTagsPrioritizedProcedure, {
      input: { departmentId: "dep-1" },
    })

    expect(result).toEqual({ items: [] })
    expect(listSkillTagsPrioritizedMock).toHaveBeenCalledWith("dep-1")
  })

  test("createSkillProcedure delegates with name and category", async () => {
    const { createSkillProcedure } = await import("@/server/orpc/routes/skills")

    const result = await callProcedure(createSkillProcedure, {
      input: { name: "Rust", category: "language" },
      context: {
        user: { id: "user-1", role: "admin", rawRole: "admin" },
      },
    })

    expect(result).toEqual({
      id: "skill-1",
      name: "Test",
      slug: "test",
      created: true,
    })
    expect(createSkillMock).toHaveBeenCalledWith(
      { name: "Rust", categoryId: 1, force: undefined },
      "user-1",
      "admin",
    )
  })
})
