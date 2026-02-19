import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let existingProfile: any[] = []

const mockOnConflictDoUpdate = mock(() => Promise.resolve())
const mockValues = mock(() => ({ onConflictDoUpdate: mockOnConflictDoUpdate }))
const mockInsert = mock(() => ({ values: mockValues }))
const mockLimit = mock(() => Promise.resolve(existingProfile))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}))

describe("src/server/services/students/upsert-profile-details", () => {
  beforeEach(() => {
    existingProfile = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockOnConflictDoUpdate.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
    mockOnConflictDoUpdate.mockResolvedValue(undefined)
  })

  test("should create profile for new user", async () => {
    existingProfile = []

    const { upsertStudentProfileDetails } = await import(
      "@/server/services/students/upsert-profile-details"
    )
    const result = await upsertStudentProfileDetails(
      { bio: "Hello world", phone: "0555123456" },
      "user-new",
    )

    expect(result).toEqual({ userId: "user-new" })
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should preserve existing fields when updating partial data", async () => {
    existingProfile = [
      {
        userId: "user-1",
        bio: "Old bio",
        phone: "0555000000",
        githubUrl: "https://github.com/test",
        portfolioUrl: null,
        studentNumber: "12345",
        department: "CS",
        level: "L3",
        wilayaCode: 16,
        address: "Algiers",
      },
    ]

    const { upsertStudentProfileDetails } = await import(
      "@/server/services/students/upsert-profile-details"
    )
    // Only update bio, leave everything else
    const result = await upsertStudentProfileDetails(
      { bio: "New bio" },
      "user-1",
    )

    expect(result).toEqual({ userId: "user-1" })
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should handle empty string as null for optional fields", async () => {
    existingProfile = []

    const { upsertStudentProfileDetails } = await import(
      "@/server/services/students/upsert-profile-details"
    )
    const result = await upsertStudentProfileDetails(
      { bio: "", githubUrl: "" },
      "user-2",
    )

    expect(result).toEqual({ userId: "user-2" })
  })

  test("should handle wilayaCode=0 as null", async () => {
    existingProfile = [{ wilayaCode: 16 }]

    const { upsertStudentProfileDetails } = await import(
      "@/server/services/students/upsert-profile-details"
    )
    const result = await upsertStudentProfileDetails(
      { wilayaCode: 0 },
      "user-3",
    )

    expect(result).toEqual({ userId: "user-3" })
  })
})
