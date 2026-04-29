import { beforeEach, describe, expect, mock, test } from "bun:test"

// First select = departmentSkill query (select->from->where => returns rows)
// Second select = skillTag query (select->from->orderBy => returns rows)
let selectCallIdx = 0

const mockWhere = mock(() => Promise.resolve([] as any[]))
const mockOrderBy = mock(() => Promise.resolve([] as any[]))

const mockFrom = mock(() => {
  if (selectCallIdx === 1) {
    return { where: mockWhere }
  }
  return { orderBy: mockOrderBy }
})

const mockSelect = mock(() => {
  selectCallIdx++
  return { from: mockFrom }
})

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

describe("src/server/services/skills/list-prioritized", () => {
  beforeEach(() => {
    applyMocks()

    selectCallIdx = 0
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()

    mockSelect.mockImplementation(() => {
      selectCallIdx++
      return { from: mockFrom }
    })
    mockFrom.mockImplementation(() => {
      if (selectCallIdx === 1) {
        return { where: mockWhere }
      }
      return { orderBy: mockOrderBy }
    })
  })

  test("should separate department skills from other skills", async () => {
    mockWhere.mockResolvedValue([{ skillTagId: "skill-1" }])
    mockOrderBy.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react", category: "frontend" },
      { id: "skill-2", name: "Node.js", slug: "node-js", category: "backend" },
    ])

    const { listSkillTagsPrioritized } = await import(
      `@/server/services/skills/list-prioritized?fresh=${Date.now()}`
    )

    const result = await listSkillTagsPrioritized("dept-1")

    expect(result.departmentSkills).toHaveLength(1)
    expect(result.departmentSkills[0]).toMatchObject({
      id: "skill-1",
      name: "React",
    })
    expect(result.otherSkills).toHaveLength(1)
    expect(result.otherSkills[0]).toMatchObject({
      id: "skill-2",
      name: "Node.js",
    })
  })

  test("should return all skills as other when department has none", async () => {
    mockWhere.mockResolvedValue([])
    mockOrderBy.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react", category: "frontend" },
    ])

    const { listSkillTagsPrioritized } = await import(
      `@/server/services/skills/list-prioritized?fresh=${Date.now()}`
    )

    const result = await listSkillTagsPrioritized("dept-1")

    expect(result.departmentSkills).toHaveLength(0)
    expect(result.otherSkills).toHaveLength(1)
  })
})
