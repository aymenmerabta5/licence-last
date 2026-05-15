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

let dbSelectResult: unknown[] = [{ id: 1 }]
let dbOrderByResult: unknown[] = []

function createDbChain(result: unknown[]) {
  return {
    limit(_n?: number) {
      return Promise.resolve(result)
    },
    orderBy() {
      return createDbChain(dbOrderByResult)
    },
    then(resolve: (value: unknown[]) => unknown) {
      return resolve(result)
    },
  }
}

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  universityProcedureAssistant: createProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => createDbChain(dbSelectResult),
        innerJoin: () => ({
          where: () => createDbChain(dbOrderByResult),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: 1 }]),
        onConflictDoNothing: () => Promise.resolve(undefined),
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
    dbSelectResult = [{ id: 1 }]
    dbOrderByResult = []
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

  test("createSkillProcedure allows super_admin", async () => {
    const { createSkillProcedure } = await import("@/server/orpc/routes/skills")

    const result = await callProcedure(createSkillProcedure, {
      input: { name: "Rust", categoryId: 1 },
      context: {
        user: { id: "user-1", role: "super_admin", rawRole: "super_admin" },
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
      "super_admin",
    )
  })

  test("createSkillProcedure allows company_admin", async () => {
    const { createSkillProcedure } = await import("@/server/orpc/routes/skills")

    const result = await callProcedure(createSkillProcedure, {
      input: { name: "Rust", categoryId: 1 },
      context: {
        user: { id: "user-1", role: "company_admin", rawRole: "company_admin" },
      },
    })

    expect(result).toEqual({
      id: "skill-1",
      name: "Test",
      slug: "test",
      created: true,
    })
  })

  test("createSkillProcedure allows company_owner", async () => {
    const { createSkillProcedure } = await import("@/server/orpc/routes/skills")

    const result = await callProcedure(createSkillProcedure, {
      input: { name: "Rust", categoryId: 1 },
      context: {
        user: {
          id: "user-1",
          role: "company_owner",
          rawRole: "company_owner",
        },
      },
    })

    expect(result).toEqual({
      id: "skill-1",
      name: "Test",
      slug: "test",
      created: true,
    })
  })

  test("createSkillProcedure allows dept_head when category is assigned", async () => {
    dbSelectResult = [{ categoryId: 1 }]
    const { createSkillProcedure } = await import("@/server/orpc/routes/skills")

    const result = await callProcedure(createSkillProcedure, {
      input: { name: "Rust", categoryId: 1 },
      context: {
        user: {
          id: "user-1",
          role: "dept_head",
          rawRole: "dept_head",
          universityDepartmentId: "dept-1",
        },
      },
    })

    expect(result).toEqual({
      id: "skill-1",
      name: "Test",
      slug: "test",
      created: true,
    })
  })

  test("createSkillProcedure rejects dept_head when category is not assigned", async () => {
    dbSelectResult = [{ categoryId: 2 }]
    const { createSkillProcedure } = await import("@/server/orpc/routes/skills")

    await expect(
      callProcedure(createSkillProcedure, {
        input: { name: "Rust", categoryId: 1 },
        context: {
          user: {
            id: "user-1",
            role: "dept_head",
            rawRole: "dept_head",
            universityDepartmentId: "dept-1",
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "This category is not assigned to your department",
    })
  })

  test("createSkillProcedure rejects students", async () => {
    const { createSkillProcedure } = await import("@/server/orpc/routes/skills")

    await expect(
      callProcedure(createSkillProcedure, {
        input: { name: "Rust", categoryId: 1 },
        context: {
          user: { id: "user-1", role: "student", rawRole: "student" },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      data: { code: "SKILL_CREATE_ACCESS_REQUIRED" },
    })
  })

  test("listSkillCategoriesProcedure returns active categories", async () => {
    dbOrderByResult = [
      {
        id: 1,
        name: "Programming",
        slug: "programming",
        description: "Programming languages",
        icon: null,
        status: "active",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ]

    const { listSkillCategoriesProcedure } = await import(
      "@/server/orpc/routes/skills"
    )

    const result = await callProcedure(listSkillCategoriesProcedure, {})

    expect(result).toEqual([
      {
        id: 1,
        name: "Programming",
        slug: "programming",
        description: "Programming languages",
        icon: null,
        status: "active",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ])
  })
})
