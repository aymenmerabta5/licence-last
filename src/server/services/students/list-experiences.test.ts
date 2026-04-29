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

describe("src/server/services/students/list-experiences", () => {
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

  test("should return experiences for a user", async () => {
    const experiences = [
      {
        id: "exp-1",
        title: "Intern",
        organization: "Acme",
        description: "Dev work",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-01"),
        isCurrent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockOrderBy.mockResolvedValue(experiences)

    const { listStudentExperiences } = await import(
      `@/server/services/students/list-experiences?fresh=${Date.now()}`
    )

    const result = await listStudentExperiences("user-1")

    expect(result).toEqual(experiences)
    expect(mockSelect).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  test("should return empty array when user has no experiences", async () => {
    mockOrderBy.mockResolvedValue([])

    const { listStudentExperiences } = await import(
      `@/server/services/students/list-experiences?fresh=${Date.now()}`
    )

    const result = await listStudentExperiences("user-1")

    expect(result).toEqual([])
  })
})
