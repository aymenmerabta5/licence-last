import { beforeEach, describe, expect, mock, test } from "bun:test"

interface SkillTag {
  id: string
  name: string
  slug: string
  category: string | null
}

const mockResult: SkillTag[] = []

const mockOffset = mock(() => Promise.resolve(mockResult))
const mockLimit = mock(() => ({ offset: mockOffset }))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

function applySkillsListMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

let listSkillTagsImportCounter = 0
async function importListSkillTags() {
  listSkillTagsImportCounter += 1
  return import(
    `@/server/services/skills/list?test=${listSkillTagsImportCounter}`
  )
}

describe("src/server/services/skills/list", () => {
  beforeEach(() => {
    applySkillsListMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()
    mockLimit.mockClear()
    mockOffset.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
    mockLimit.mockReturnValue({ offset: mockOffset })
    mockOffset.mockResolvedValue([])
  })

  test("should return all skills when no category filter", async () => {
    const skills: SkillTag[] = [
      { id: "1", name: "React", slug: "react", category: "frontend" },
      { id: "2", name: "Node.js", slug: "node-js", category: "backend" },
    ]
    mockOffset.mockResolvedValue(skills)

    const { listSkillTags } = await importListSkillTags()
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
    mockOffset.mockResolvedValue(skills)

    const { listSkillTags } = await importListSkillTags()
    const result = await listSkillTags({ category: "frontend" })

    expect(result.skills).toEqual(skills)
    expect(mockWhere).toHaveBeenCalled()
  })
})
