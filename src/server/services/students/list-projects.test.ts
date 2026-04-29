import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockOrderBy = mock(() => Promise.resolve([] as any[]))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

describe("src/server/services/students/list-projects", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
  })

  test("should return projects for a user", async () => {
    const projects = [
      {
        id: "proj-1",
        name: "Portfolio",
        summary: "Personal site",
        projectUrl: "https://example.com",
        repositoryUrl: "https://github.com/user/portfolio",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockOrderBy.mockResolvedValue(projects)

    const { listStudentProjects } = await import(
      `@/server/services/students/list-projects?fresh=${Date.now()}`
    )

    const result = await listStudentProjects("user-1")

    expect(result).toEqual(projects)
    expect(mockSelect).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  test("should return empty array when user has no projects", async () => {
    mockOrderBy.mockResolvedValue([])

    const { listStudentProjects } = await import(
      `@/server/services/students/list-projects?fresh=${Date.now()}`
    )

    const result = await listStudentProjects("user-1")

    expect(result).toEqual([])
  })
})
