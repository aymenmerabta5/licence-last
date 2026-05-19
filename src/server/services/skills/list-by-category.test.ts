import { beforeEach, describe, expect, mock, test } from "bun:test"

/* eslint-disable @typescript-eslint/no-explicit-any */

function makeChain(result: any): any {
  const chain: any = {
    limit: () => makeChain(result),
    offset: () => Promise.resolve(result),
    orderBy: () => makeEndable(result),
    where: () => makeEndable(result),
    innerJoin: () => makeEndable(result),
    from: () => makeEndable(result),
  }
  return chain
}

function makeEndable(result: any): any {
  return {
    ...makeChain(result),
    then(resolve: (value: any) => any) {
      return resolve(result)
    },
  }
}

const mockSelectDistinct = mock(() => makeEndable([]))
const mockSelect = mock(() => makeEndable([]))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      selectDistinct: mockSelectDistinct,
    },
  }))
}

let importCounter = 0
async function importListSkillsByCategory() {
  importCounter += 1
  return import(
    `@/server/services/skills/list-by-category?test=${importCounter}`
  )
}

describe("src/server/services/skills/list-by-category", () => {
  beforeEach(() => {
    applyMocks()
    mockSelect.mockClear()
    mockSelectDistinct.mockClear()
  })

  test("should return empty when no categories match", async () => {
    const { listSkillsByCategory } = await importListSkillsByCategory()
    const result = await listSkillsByCategory()

    expect(result.categories).toEqual([])
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeNull()
  })

  test("should return paginated categories with skills", async () => {
    const allCategories = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const pageCategories = [
      { id: 1, name: "Programming", slug: "programming" },
      { id: 2, name: "Design", slug: "design" },
    ]
    const pageSkills = [
      { id: "s1", name: "React", slug: "react", category: "programming", categoryId: 1 },
      { id: "s2", name: "Vue", slug: "vue", category: "programming", categoryId: 1 },
      { id: "s3", name: "Figma", slug: "figma", category: "design", categoryId: 2 },
    ]

    let callCount = 0
    mockSelect.mockImplementation(() => {
      callCount += 1
      if (callCount === 1) {
        return makeEndable(allCategories)
      }
      if (callCount === 2) {
        return makeEndable(pageCategories)
      }
      return makeEndable(pageSkills)
    })

    const { listSkillsByCategory } = await importListSkillsByCategory()
    const result = await listSkillsByCategory({ limit: 2 })

    expect(result.categories).toHaveLength(2)
    expect(result.categories[0].skills).toHaveLength(2)
    expect(result.categories[1].skills).toHaveLength(1)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBe(2)
  })

  test("should paginate with cursor", async () => {
    const allCategories = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const pageCategories = [{ id: 3, name: "DevOps", slug: "devops" }]
    const pageSkills = [
      { id: "s4", name: "Docker", slug: "docker", category: "devops", categoryId: 3 },
    ]

    let callCount = 0
    mockSelect.mockImplementation(() => {
      callCount += 1
      if (callCount === 1) {
        return makeEndable(allCategories)
      }
      if (callCount === 2) {
        return makeEndable(pageCategories)
      }
      return makeEndable(pageSkills)
    })

    const { listSkillsByCategory } = await importListSkillsByCategory()
    const result = await listSkillsByCategory({ cursor: 2, limit: 2 })

    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].skills).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })

  test("should filter by search query", async () => {
    const matchingCategories = [{ categoryId: 1 }]
    const pageCategories = [{ id: 1, name: "Programming", slug: "programming" }]
    const pageSkills = [
      { id: "s1", name: "React", slug: "react", category: "programming", categoryId: 1 },
    ]

    mockSelectDistinct.mockImplementation(() => makeEndable(matchingCategories))

    let callCount = 0
    mockSelect.mockImplementation(() => {
      callCount += 1
      if (callCount === 1) {
        return makeEndable(pageCategories)
      }
      return makeEndable(pageSkills)
    })

    const { listSkillsByCategory } = await importListSkillsByCategory()
    const result = await listSkillsByCategory({ query: "react" })

    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].skills).toHaveLength(1)
    expect(result.categories[0].skills[0].name).toBe("React")
  })
})
