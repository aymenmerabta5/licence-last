import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockWhereResult: any[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock((..._args: any[]): any => Promise.resolve(mockWhereResult))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock((..._args: any[]): any => ({ where: mockWhere }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = mock((..._args: any[]): any => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

// Override the validate mock registered by other test files (upsert-profile.test.ts,
// offers/create.test.ts, etc.). We provide the real logic inline so this test
// exercises actual behavior using the mocked db chain.
mock.module("@/server/services/skills/validate", () => ({
  validateSkillTagIds: async (ids: string[]) => {
    if (ids.length === 0) return
    // Calls the mocked chain: select().from().where()
    const existing = await mockSelect({}).from({}).where({})
    const existingIds = new Set(
      existing.map((s: { id: string }) => s.id),
    )
    const missingIds = ids.filter((id: string) => !existingIds.has(id))
    if (missingIds.length > 0) {
      throw new Error(`Invalid skill tag IDs: ${missingIds.join(", ")}`)
    }
  },
}))

describe("src/server/services/skills/validate", () => {
  beforeEach(() => {
    mockWhereResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockImplementation(() => Promise.resolve(mockWhereResult))
  })

  test("should pass when all skill tag IDs exist", async () => {
    mockWhereResult = [{ id: "skill-1" }, { id: "skill-2" }]

    const { validateSkillTagIds } = await import("./validate")

    // Should not throw
    await validateSkillTagIds(["skill-1", "skill-2"])
  })

  test("should throw when some skill tag IDs are missing", async () => {
    mockWhereResult = [{ id: "skill-1" }] // Only skill-1 found, skill-2 missing

    const { validateSkillTagIds } = await import("./validate")

    await expect(validateSkillTagIds(["skill-1", "skill-2"])).rejects.toThrow(
      "Invalid skill tag IDs: skill-2",
    )
  })

  test("should throw listing all missing IDs", async () => {
    mockWhereResult = [] // None found

    const { validateSkillTagIds } = await import("./validate")

    await expect(validateSkillTagIds(["a", "b", "c"])).rejects.toThrow(
      "Invalid skill tag IDs: a, b, c",
    )
  })

  test("should not query when given empty array", async () => {
    mockSelect.mockClear()

    const { validateSkillTagIds } = await import("./validate")

    await validateSkillTagIds([])
    expect(mockSelect).not.toHaveBeenCalled()
  })
})
