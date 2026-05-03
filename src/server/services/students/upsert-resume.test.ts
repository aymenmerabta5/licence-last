import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockReturning = mock(() => Promise.resolve([] as any[]))
const mockOnConflictDoUpdate = mock(() => ({ returning: mockReturning }))
const mockValues = mock(() => ({ onConflictDoUpdate: mockOnConflictDoUpdate }))
const mockInsert = mock(() => ({ values: mockValues }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      insert: mockInsert,
    },
  }))
}

describe("src/server/services/students/upsert-resume", () => {
  beforeEach(() => {
    applyMocks()

    mockInsert.mockClear()
    mockValues.mockClear()
    mockOnConflictDoUpdate.mockClear()
    mockReturning.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
    mockOnConflictDoUpdate.mockReturnValue({ returning: mockReturning })
  })

  test("should insert a new resume and return it", async () => {
    const resume = {
      fileKey: "resume.pdf",
      fileName: "resume.pdf",
      fileUrl: "https://cdn.example.com/resume.pdf",
      fileSizeBytes: 1024,
      mimeType: "application/pdf",
      uploadedAt: new Date("2024-01-01"),
    }
    mockReturning.mockResolvedValue([resume])

    const { upsertStudentResume } = await import(
      `@/server/services/students/upsert-resume?fresh=${Date.now()}`
    )

    const result = await upsertStudentResume("user-1", {
      fileKey: "resume.pdf",
      fileName: "resume.pdf",
      fileUrl: "https://cdn.example.com/resume.pdf",
      fileSizeBytes: 1024,
      mimeType: "application/pdf",
    })

    expect(result).toEqual(resume)
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockOnConflictDoUpdate).toHaveBeenCalledTimes(1)
  })

  test("should upsert on conflict by userId", async () => {
    const resume = {
      fileKey: "resume-v2.pdf",
      fileName: "resume-v2.pdf",
      fileUrl: "https://cdn.example.com/resume-v2.pdf",
      fileSizeBytes: 2048,
      mimeType: "application/pdf",
      uploadedAt: new Date("2024-06-01"),
    }
    mockReturning.mockResolvedValue([resume])

    const { upsertStudentResume } = await import(
      `@/server/services/students/upsert-resume?fresh=${Date.now()}`
    )

    await upsertStudentResume("user-1", {
      fileKey: "resume-v2.pdf",
      fileName: "resume-v2.pdf",
      fileUrl: "https://cdn.example.com/resume-v2.pdf",
      fileSizeBytes: 2048,
      mimeType: "application/pdf",
    })

    const updateSet = (
      mockOnConflictDoUpdate.mock.calls[0] as unknown as [
        Record<string, unknown>,
      ]
    )[0]
    expect(updateSet.set).toBeDefined()
    expect(updateSet.target).toBeDefined()
  })
})
