import { describe, test, expect, mock, beforeEach } from "bun:test"

interface SkillTag {
  id: string
  name: string
  slug: string
  category: string | null
}

// Mock the db module
const mockOrderBy = mock<() => Promise<SkillTag[]>>(() => Promise.resolve([]))
const mockWhere = mock<() => Promise<SkillTag[]>>(() => Promise.resolve([]))
const mockFrom = mock(() => ({ orderBy: mockOrderBy }))
const mockSelect = mock(() => ({ from: mockFrom }))

mockOrderBy.mockReturnValue(
  Object.assign(Promise.resolve([] as SkillTag[]), { where: mockWhere }),
)

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

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue(
      Object.assign(Promise.resolve([] as SkillTag[]), { where: mockWhere }),
    )
  })

  test("should return all skills when no category filter", async () => {
    const mockSkills: SkillTag[] = [
      { id: "1", name: "React", slug: "react", category: "frontend" },
      { id: "2", name: "Node.js", slug: "node-js", category: "backend" },
    ]
    mockOrderBy.mockReturnValue(
      Object.assign(Promise.resolve(mockSkills), { where: mockWhere }),
    )

    const { listSkillTags } = await import("./list")
    const result = await listSkillTags()

    expect(result).toEqual(mockSkills)
    expect(mockSelect).toHaveBeenCalled()
    expect(mockFrom).toHaveBeenCalled()
  })

  test("should filter by category when provided", async () => {
    const mockSkills: SkillTag[] = [
      { id: "1", name: "React", slug: "react", category: "frontend" },
    ]
    mockWhere.mockResolvedValue(mockSkills)

    const { listSkillTags } = await import("./list")
    const result = await listSkillTags("frontend")

    expect(result).toEqual(mockSkills)
    expect(mockWhere).toHaveBeenCalled()
  })
})
