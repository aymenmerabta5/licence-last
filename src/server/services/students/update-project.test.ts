import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([] as any[]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockSetWhere = mock(() => Promise.resolve())
const mockSet = mock(() => ({ where: mockSetWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      update: mockUpdate,
    },
  }))
}

describe("src/server/services/students/update-project", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockSetWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockSetWhere })
  })

  test("should update project when it exists and belongs to user", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "proj-1",
        userId: "user-1",
        name: "Old Name",
        summary: "Old Summary",
        projectUrl: null,
        repositoryUrl: null,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-01"),
      },
    ])

    const { updateStudentProject } = await import(
      `@/server/services/students/update-project?fresh=${Date.now()}`
    )

    const result = await updateStudentProject(
      "proj-1",
      { name: "New Name" },
      "user-1",
    )

    expect(result).toEqual({ projectId: "proj-1" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)

    const changes = (mockSet.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(changes.name).toBe("New Name")
  })

  test("should throw PROJECT_NOT_FOUND when project does not exist", async () => {
    mockLimit.mockResolvedValue([])

    const { updateStudentProject } = await import(
      `@/server/services/students/update-project?fresh=${Date.now()}`
    )

    await expect(
      updateStudentProject("proj-1", { name: "New" }, "user-1"),
    ).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found",
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should throw PROJECT_FORBIDDEN when project belongs to another user", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "proj-1",
        userId: "user-2",
        name: "Old Name",
        summary: "Old Summary",
        projectUrl: null,
        repositoryUrl: null,
        startDate: null,
        endDate: null,
      },
    ])

    const { updateStudentProject } = await import(
      `@/server/services/students/update-project?fresh=${Date.now()}`
    )

    await expect(
      updateStudentProject("proj-1", { name: "New" }, "user-1"),
    ).rejects.toMatchObject({
      code: "PROJECT_FORBIDDEN",
      message: "You do not have access to this project",
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should throw INVALID_DATE_RANGE when startDate > endDate", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "proj-1",
        userId: "user-1",
        name: "Old Name",
        summary: "Old Summary",
        projectUrl: null,
        repositoryUrl: null,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-01-01"),
      },
    ])

    const { updateStudentProject } = await import(
      `@/server/services/students/update-project?fresh=${Date.now()}`
    )

    await expect(
      updateStudentProject(
        "proj-1",
        { startDate: new Date("2024-06-01") },
        "user-1",
      ),
    ).rejects.toMatchObject({
      code: "INVALID_DATE_RANGE",
      message: "Project start date must be before end date",
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should trim name, summary, and urls", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "proj-1",
        userId: "user-1",
        name: "Old Name",
        summary: "Old Summary",
        projectUrl: null,
        repositoryUrl: null,
        startDate: null,
        endDate: null,
      },
    ])

    const { updateStudentProject } = await import(
      `@/server/services/students/update-project?fresh=${Date.now()}`
    )

    await updateStudentProject(
      "proj-1",
      {
        name: "  New Name  ",
        summary: "  New Summary  ",
        projectUrl: "  https://example.com  ",
        repositoryUrl: "  https://github.com  ",
      },
      "user-1",
    )

    const changes = (mockSet.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(changes.name).toBe("New Name")
    expect(changes.summary).toBe("New Summary")
    expect(changes.projectUrl).toBe("https://example.com")
    expect(changes.repositoryUrl).toBe("https://github.com")
  })

  test("should nullify empty urls", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "proj-1",
        userId: "user-1",
        name: "Old Name",
        summary: "Old Summary",
        projectUrl: "https://example.com",
        repositoryUrl: "https://github.com",
        startDate: null,
        endDate: null,
      },
    ])

    const { updateStudentProject } = await import(
      `@/server/services/students/update-project?fresh=${Date.now()}`
    )

    await updateStudentProject(
      "proj-1",
      { projectUrl: "   ", repositoryUrl: "" },
      "user-1",
    )

    const changes = (mockSet.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(changes.projectUrl).toBeNull()
    expect(changes.repositoryUrl).toBeNull()
  })
})
