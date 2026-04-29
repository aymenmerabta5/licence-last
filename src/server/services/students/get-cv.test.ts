import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([] as any[]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))

  mock.module("@/server/services/students/list-experiences", () => ({
    listStudentExperiences: mock(async () => [
      { id: "exp-1", title: "Intern", organization: "Acme" },
    ]),
  }))

  mock.module("@/server/services/students/list-projects", () => ({
    listStudentProjects: mock(async () => [
      { id: "proj-1", name: "Portfolio", summary: "Personal site" },
    ]),
  }))
}

describe("src/server/services/students/get-cv", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("should return experiences, projects, and resume", async () => {
    mockLimit.mockResolvedValue([
      {
        fileKey: "resume.pdf",
        fileName: "resume.pdf",
        fileUrl: "https://cdn.example.com/resume.pdf",
        fileSizeBytes: 1024,
        mimeType: "application/pdf",
        uploadedAt: new Date("2024-01-01"),
      },
    ])

    const { getStudentCv } = await import(
      `@/server/services/students/get-cv?fresh=${Date.now()}`
    )

    const result = await getStudentCv("user-1")

    expect(result.experiences).toEqual([
      { id: "exp-1", title: "Intern", organization: "Acme" },
    ])
    expect(result.projects).toEqual([
      { id: "proj-1", name: "Portfolio", summary: "Personal site" },
    ])
    expect(result.resume).toMatchObject({
      fileKey: "resume.pdf",
      fileName: "resume.pdf",
    })
  })

  test("should return null resume when none exists", async () => {
    mockLimit.mockResolvedValue([])

    const { getStudentCv } = await import(
      `@/server/services/students/get-cv?fresh=${Date.now()}`
    )

    const result = await getStudentCv("user-1")

    expect(result.resume).toBeNull()
  })
})
