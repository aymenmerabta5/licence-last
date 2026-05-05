import { beforeEach, describe, expect, mock, test } from "bun:test"

let deptSkillIds: string[] = []

const mockGetEffective = mock(() => Promise.resolve(deptSkillIds))

mock.module("@/server/services/departments/get-effective-skills", () => ({
  getEffectiveDepartmentSkillIds: mockGetEffective,
}))

const mockOrderBy = mock(() => Promise.resolve([] as any[]))
const mockFrom = mock(() => ({ orderBy: mockOrderBy }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: { select: mockSelect },
}))

describe("src/server/services/skills/list-prioritized", () => {
  beforeEach(() => {
    deptSkillIds = []
    mockGetEffective.mockClear()
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockOrderBy.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ orderBy: mockOrderBy })
  })

  test("should separate department skills from other skills", async () => {
    deptSkillIds = ["skill-1"]
    mockOrderBy.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react", category: "frontend" },
      { id: "skill-2", name: "Node.js", slug: "node-js", category: "backend" },
    ])

    const { listSkillTagsPrioritized } = await import(
      `@/server/services/skills/list-prioritized?fresh=${Date.now()}`
    )

    const result = await listSkillTagsPrioritized("dept-1")

    expect(mockGetEffective).toHaveBeenCalledWith("dept-1")
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
    deptSkillIds = []
    mockOrderBy.mockResolvedValue([
      { id: "skill-1", name: "React", slug: "react", category: "frontend" },
    ])

    const { listSkillTagsPrioritized } = await import(
      `@/server/services/skills/list-prioritized?fresh=${Date.now()}`
    )

    const result = await listSkillTagsPrioritized("dept-1")

    expect(mockGetEffective).toHaveBeenCalledWith("dept-1")
    expect(result.departmentSkills).toHaveLength(0)
    expect(result.otherSkills).toHaveLength(1)
  })
})
