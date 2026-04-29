import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([] as any[]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockDeleteWhere = mock(() => Promise.resolve())
const mockDelete = mock(() => ({ where: mockDeleteWhere }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      delete: mockDelete,
    },
  }))
}

describe("src/server/services/students/delete-project", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockDelete.mockReturnValue({ where: mockDeleteWhere })
  })

  test("should delete project when it exists and belongs to user", async () => {
    mockLimit.mockResolvedValue([{ id: "proj-1", userId: "user-1" }])

    const { deleteStudentProject } = await import(
      `@/server/services/students/delete-project?fresh=${Date.now()}`
    )

    const result = await deleteStudentProject("proj-1", "user-1")

    expect(result).toEqual({ projectId: "proj-1", deleted: true })
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })

  test("should throw PROJECT_NOT_FOUND when project does not exist", async () => {
    mockLimit.mockResolvedValue([])

    const { deleteStudentProject } = await import(
      `@/server/services/students/delete-project?fresh=${Date.now()}`
    )

    await expect(deleteStudentProject("proj-1", "user-1")).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found",
    })

    expect(mockDelete).not.toHaveBeenCalled()
  })

  test("should throw PROJECT_FORBIDDEN when project belongs to another user", async () => {
    mockLimit.mockResolvedValue([{ id: "proj-1", userId: "user-2" }])

    const { deleteStudentProject } = await import(
      `@/server/services/students/delete-project?fresh=${Date.now()}`
    )

    await expect(deleteStudentProject("proj-1", "user-1")).rejects.toMatchObject({
      code: "PROJECT_FORBIDDEN",
      message: "You do not have access to this project",
    })

    expect(mockDelete).not.toHaveBeenCalled()
  })
})
