import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      insert: mockInsert,
    },
  }))
}

describe("src/server/services/students/create-project", () => {
  beforeEach(() => {
    applyMocks()

    mockInsert.mockClear()
    mockValues.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should create a project and return projectId", async () => {
    const { createStudentProject } = await import(
      `@/server/services/students/create-project?fresh=${Date.now()}`
    )

    const result = await createStudentProject(
      {
        name: "Portfolio",
        summary: "Personal site",
        projectUrl: "https://example.com",
        repositoryUrl: "https://github.com/user/portfolio",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-01"),
      },
      "user-1",
    )

    expect(result.projectId).toBeDefined()
    expect(typeof result.projectId).toBe("string")
    expect(mockInsert).toHaveBeenCalledTimes(1)

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.userId).toBe("user-1")
    expect(payload.name).toBe("Portfolio")
    expect(payload.summary).toBe("Personal site")
    expect(payload.projectUrl).toBe("https://example.com")
    expect(payload.repositoryUrl).toBe("https://github.com/user/portfolio")
  })

  test("should trim name, summary, and urls", async () => {
    const { createStudentProject } = await import(
      `@/server/services/students/create-project?fresh=${Date.now()}`
    )

    await createStudentProject(
      {
        name: "  Portfolio  ",
        summary: "  Personal site  ",
        projectUrl: "  https://example.com  ",
        repositoryUrl: "  https://github.com  ",
        startDate: new Date("2024-01-01"),
      },
      "user-1",
    )

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.name).toBe("Portfolio")
    expect(payload.summary).toBe("Personal site")
    expect(payload.projectUrl).toBe("https://example.com")
    expect(payload.repositoryUrl).toBe("https://github.com")
  })

  test("should nullify empty urls", async () => {
    const { createStudentProject } = await import(
      `@/server/services/students/create-project?fresh=${Date.now()}`
    )

    await createStudentProject(
      {
        name: "Portfolio",
        summary: "Personal site",
        projectUrl: "   ",
        repositoryUrl: "",
      },
      "user-1",
    )

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.projectUrl).toBeNull()
    expect(payload.repositoryUrl).toBeNull()
  })

  test("should throw INVALID_DATE_RANGE when startDate > endDate", async () => {
    const { createStudentProject } = await import(
      `@/server/services/students/create-project?fresh=${Date.now()}`
    )

    await expect(
      createStudentProject(
        {
          name: "Portfolio",
          summary: "Personal site",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-01-01"),
        },
        "user-1",
      ),
    ).rejects.toMatchObject({
      code: "INVALID_DATE_RANGE",
      message: "Project start date must be before end date",
    })

    expect(mockInsert).not.toHaveBeenCalled()
  })

  test("should allow null dates", async () => {
    const { createStudentProject } = await import(
      `@/server/services/students/create-project?fresh=${Date.now()}`
    )

    await createStudentProject(
      {
        name: "Portfolio",
        summary: "Personal site",
      },
      "user-1",
    )

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.startDate).toBeNull()
    expect(payload.endDate).toBeNull()
  })
})
