import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockReturning = mock(() => Promise.resolve([] as any[]))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockDelete = mock(() => ({ where: mockWhere }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      delete: mockDelete,
    },
  }))
}

describe("src/server/services/students/delete-resume", () => {
  beforeEach(() => {
    applyMocks()

    mockDelete.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockDelete.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should delete resume and return fileKey when it exists", async () => {
    mockReturning.mockResolvedValue([{ fileKey: "resume-1.pdf" }])

    const { deleteStudentResume } = await import(
      `@/server/services/students/delete-resume?fresh=${Date.now()}`
    )

    const result = await deleteStudentResume("user-1")

    expect(result).toEqual({ deleted: true, fileKey: "resume-1.pdf" })
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })

  test("should throw RESUME_NOT_FOUND when resume does not exist", async () => {
    mockReturning.mockResolvedValue([])

    const { deleteStudentResume } = await import(
      `@/server/services/students/delete-resume?fresh=${Date.now()}`
    )

    await expect(deleteStudentResume("user-1")).rejects.toMatchObject({
      code: "RESUME_NOT_FOUND",
      message: "Resume not found",
    })

    expect(mockDelete).toHaveBeenCalledTimes(1)
  })
})
