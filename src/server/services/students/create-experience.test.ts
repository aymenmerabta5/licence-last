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

describe("src/server/services/students/create-experience", () => {
  beforeEach(() => {
    applyMocks()

    mockInsert.mockClear()
    mockValues.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should create an experience and return experienceId", async () => {
    const { createStudentExperience } = await import(
      `@/server/services/students/create-experience?fresh=${Date.now()}`
    )

    const result = await createStudentExperience(
      {
        title: "Intern",
        organization: "Acme",
        description: "Dev work",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-01"),
        isCurrent: false,
      },
      "user-1",
    )

    expect(result.experienceId).toBeDefined()
    expect(typeof result.experienceId).toBe("string")
    expect(mockInsert).toHaveBeenCalledTimes(1)

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.userId).toBe("user-1")
    expect(payload.title).toBe("Intern")
    expect(payload.organization).toBe("Acme")
    expect(payload.description).toBe("Dev work")
    expect(payload.isCurrent).toBe(false)
    expect(payload.endDate).toEqual(new Date("2024-06-01"))
  })

  test("should trim title, organization, and description", async () => {
    const { createStudentExperience } = await import(
      `@/server/services/students/create-experience?fresh=${Date.now()}`
    )

    await createStudentExperience(
      {
        title: "  Intern  ",
        organization: "  Acme  ",
        description: "  Dev work  ",
        startDate: new Date("2024-01-01"),
      },
      "user-1",
    )

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.title).toBe("Intern")
    expect(payload.organization).toBe("Acme")
    expect(payload.description).toBe("Dev work")
  })

  test("should nullify empty description", async () => {
    const { createStudentExperience } = await import(
      `@/server/services/students/create-experience?fresh=${Date.now()}`
    )

    await createStudentExperience(
      {
        title: "Intern",
        organization: "Acme",
        description: "   ",
        startDate: new Date("2024-01-01"),
      },
      "user-1",
    )

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.description).toBeNull()
  })

  test("should nullify endDate when isCurrent is true", async () => {
    const { createStudentExperience } = await import(
      `@/server/services/students/create-experience?fresh=${Date.now()}`
    )

    await createStudentExperience(
      {
        title: "Intern",
        organization: "Acme",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-01"),
        isCurrent: true,
      },
      "user-1",
    )

    const payload = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>]
    )[0]
    expect(payload.isCurrent).toBe(true)
    expect(payload.endDate).toBeNull()
  })

  test("should throw INVALID_DATE_RANGE when startDate > endDate", async () => {
    const { createStudentExperience } = await import(
      `@/server/services/students/create-experience?fresh=${Date.now()}`
    )

    await expect(
      createStudentExperience(
        {
          title: "Intern",
          organization: "Acme",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-01-01"),
        },
        "user-1",
      ),
    ).rejects.toMatchObject({
      code: "INVALID_DATE_RANGE",
      message: "Experience start date must be before end date",
    })

    expect(mockInsert).not.toHaveBeenCalled()
  })
})
