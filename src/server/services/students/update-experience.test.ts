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

describe("src/server/services/students/update-experience", () => {
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

  test("should update experience when it exists and belongs to user", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "exp-1",
        userId: "user-1",
        title: "Old Title",
        organization: "Old Org",
        description: "Old Desc",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-01"),
        isCurrent: false,
      },
    ])

    const { updateStudentExperience } = await import(
      `@/server/services/students/update-experience?fresh=${Date.now()}`
    )

    const result = await updateStudentExperience(
      "exp-1",
      { title: "New Title" },
      "user-1",
    )

    expect(result).toEqual({ experienceId: "exp-1" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)

    const changes = (mockSet.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(changes.title).toBe("New Title")
  })

  test("should throw EXPERIENCE_NOT_FOUND when experience does not exist", async () => {
    mockLimit.mockResolvedValue([])

    const { updateStudentExperience } = await import(
      `@/server/services/students/update-experience?fresh=${Date.now()}`
    )

    await expect(
      updateStudentExperience("exp-1", { title: "New" }, "user-1"),
    ).rejects.toMatchObject({
      code: "EXPERIENCE_NOT_FOUND",
      message: "Experience not found",
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should throw EXPERIENCE_FORBIDDEN when experience belongs to another user", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "exp-1",
        userId: "user-2",
        title: "Old Title",
        organization: "Old Org",
        description: null,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-01"),
        isCurrent: false,
      },
    ])

    const { updateStudentExperience } = await import(
      `@/server/services/students/update-experience?fresh=${Date.now()}`
    )

    await expect(
      updateStudentExperience("exp-1", { title: "New" }, "user-1"),
    ).rejects.toMatchObject({
      code: "EXPERIENCE_FORBIDDEN",
      message: "You do not have access to this experience",
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should throw INVALID_DATE_RANGE when startDate > endDate", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "exp-1",
        userId: "user-1",
        title: "Old Title",
        organization: "Old Org",
        description: null,
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-01-01"),
        isCurrent: false,
      },
    ])

    const { updateStudentExperience } = await import(
      `@/server/services/students/update-experience?fresh=${Date.now()}`
    )

    await expect(
      updateStudentExperience(
        "exp-1",
        { startDate: new Date("2024-06-01") },
        "user-1",
      ),
    ).rejects.toMatchObject({
      code: "INVALID_DATE_RANGE",
      message: "Experience start date must be before end date",
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should nullify endDate when isCurrent is set to true", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "exp-1",
        userId: "user-1",
        title: "Old Title",
        organization: "Old Org",
        description: null,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-01"),
        isCurrent: false,
      },
    ])

    const { updateStudentExperience } = await import(
      `@/server/services/students/update-experience?fresh=${Date.now()}`
    )

    await updateStudentExperience("exp-1", { isCurrent: true }, "user-1")

    const changes = (mockSet.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(changes.isCurrent).toBe(true)
    expect(changes.endDate).toBeNull()
  })

  test("should trim title, organization, and description", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "exp-1",
        userId: "user-1",
        title: "Old Title",
        organization: "Old Org",
        description: null,
        startDate: new Date("2024-01-01"),
        endDate: null,
        isCurrent: true,
      },
    ])

    const { updateStudentExperience } = await import(
      `@/server/services/students/update-experience?fresh=${Date.now()}`
    )

    await updateStudentExperience(
      "exp-1",
      { title: "  New Title  ", organization: "  New Org  ", description: "  New Desc  " },
      "user-1",
    )

    const changes = (mockSet.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(changes.title).toBe("New Title")
    expect(changes.organization).toBe("New Org")
    expect(changes.description).toBe("New Desc")
  })

  test("should nullify empty description", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "exp-1",
        userId: "user-1",
        title: "Old Title",
        organization: "Old Org",
        description: "Old Desc",
        startDate: new Date("2024-01-01"),
        endDate: null,
        isCurrent: true,
      },
    ])

    const { updateStudentExperience } = await import(
      `@/server/services/students/update-experience?fresh=${Date.now()}`
    )

    await updateStudentExperience(
      "exp-1",
      { description: "   " },
      "user-1",
    )

    const changes = (mockSet.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(changes.description).toBeNull()
  })
})
