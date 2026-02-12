import { describe, test, expect, mock, beforeEach } from "bun:test"

interface SkillTag {
  id: string
  name: string
  slug: string
  category: string | null
}

const mockWhere = mock<() => Promise<SkillTag[]>>(() => Promise.resolve([]))

const createMockQuery = () => {
  const query = Object.assign(Promise.resolve([] as SkillTag[]), {
    where: mockWhere,
  })
  return query
}

const mockOffset = mock(() => createMockQuery())
const mockLimit = mock(() => ({ offset: mockOffset, where: mockWhere }))
const mockOrderBy = mock(() => ({ limit: mockLimit, where: mockWhere }))
const mockFrom = mock(() => ({ orderBy: mockOrderBy }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/skills/list", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockOrderBy.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockOffset.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit, where: mockWhere })
    mockLimit.mockReturnValue({ offset: mockOffset, where: mockWhere })
    mockOffset.mockReturnValue(createMockQuery())
  })

  test("should return all skills when no category filter", async () => {
    const skills: SkillTag[] = [
      { id: "1", name: "React", slug: "react", category: "frontend" },
      { id: "2", name: "Node.js", slug: "node-js", category: "backend" },
    ]
    const mockQuery = Object.assign(Promise.resolve(skills), { where: mockWhere })
    mockOffset.mockReturnValue(mockQuery)

    const { listSkillTags } = await import("./list")
    const result = await listSkillTags()

    expect(result.skills).toEqual(skills)
    expect(result.hasMore).toBe(false)
    expect(mockSelect).toHaveBeenCalled()
    expect(mockFrom).toHaveBeenCalled()
  })

  test("should filter by category when provided", async () => {
    const skills: SkillTag[] = [
      { id: "1", name: "React", slug: "react", category: "frontend" },
    ]
    mockWhere.mockResolvedValue(skills)

    const { listSkillTags } = await import("./list")
    const result = await listSkillTags({ category: "frontend" })

    expect(result.skills).toEqual(skills)
    expect(mockWhere).toHaveBeenCalled()
  })
})
