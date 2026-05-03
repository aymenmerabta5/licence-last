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

describe("src/server/services/students/delete-experience", () => {
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

  test("should delete experience when it exists and belongs to user", async () => {
    mockLimit.mockResolvedValue([{ id: "exp-1", userId: "user-1" }])

    const { deleteStudentExperience } = await import(
      `@/server/services/students/delete-experience?fresh=${Date.now()}`
    )

    const result = await deleteStudentExperience("exp-1", "user-1")

    expect(result).toEqual({ experienceId: "exp-1", deleted: true })
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })

  test("should throw EXPERIENCE_NOT_FOUND when experience does not exist", async () => {
    mockLimit.mockResolvedValue([])

    const { deleteStudentExperience } = await import(
      `@/server/services/students/delete-experience?fresh=${Date.now()}`
    )

    await expect(
      deleteStudentExperience("exp-1", "user-1"),
    ).rejects.toMatchObject({
      code: "EXPERIENCE_NOT_FOUND",
      message: "Experience not found",
    })

    expect(mockDelete).not.toHaveBeenCalled()
  })

  test("should throw EXPERIENCE_FORBIDDEN when experience belongs to another user", async () => {
    mockLimit.mockResolvedValue([{ id: "exp-1", userId: "user-2" }])

    const { deleteStudentExperience } = await import(
      `@/server/services/students/delete-experience?fresh=${Date.now()}`
    )

    await expect(
      deleteStudentExperience("exp-1", "user-1"),
    ).rejects.toMatchObject({
      code: "EXPERIENCE_FORBIDDEN",
      message: "You do not have access to this experience",
    })

    expect(mockDelete).not.toHaveBeenCalled()
  })
})
