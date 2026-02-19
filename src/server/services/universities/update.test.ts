import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockReturning = mock(() => Promise.resolve([{ universityId: "uni-1" }]))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

mock.module("@/server/db", () => ({
  db: { update: mockUpdate },
}))

describe("updateUniversity", () => {
  beforeEach(() => {
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ universityId: "uni-1" }])
  })

  test("should update fields and return universityId", async () => {
    const { updateUniversity } = await import("@/server/services/universities/update")

    const result = await updateUniversity("uni-1", {
      name: "  Updated University  ",
      abbreviation: "  USTHB  ",
      city: "  Algiers  ",
    })

    expect(result).toEqual({ universityId: "uni-1" })
    expect(mockSet).toHaveBeenCalledWith({
      name: "Updated University",
      abbreviation: "USTHB",
      city: "Algiers",
    })
  })

  test("should return input universityId when no fields are provided", async () => {
    const { updateUniversity } = await import("@/server/services/universities/update")

    const result = await updateUniversity("uni-1", {})

    expect(result).toEqual({ universityId: "uni-1" })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should throw when university is not found", async () => {
    mockReturning.mockResolvedValue([])

    const { updateUniversity } = await import("@/server/services/universities/update")

    await expect(updateUniversity("missing", { name: "Updated" })).rejects.toThrow(
      "University not found",
    )
  })
})
