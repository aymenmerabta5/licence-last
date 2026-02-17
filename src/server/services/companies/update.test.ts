import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock((): any => [])

mock.module("@/server/db", () => ({
  db: {
    update: mockUpdate,
  },
}))

describe("src/server/services/companies/update", () => {
  beforeEach(() => {
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should update company and return companyId", async () => {
    mockReturning.mockResolvedValue([{ companyId: "company-1" }])

    const { updateCompany } = await import("@/server/services/companies/update")

    const result = await updateCompany("company-1", {
      description: "Updated description",
      phone: "0555123456",
    })

    expect(result).toEqual({ companyId: "company-1" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockSet).toHaveBeenCalledTimes(1)
  })

  test("should throw when company not found", async () => {
    mockReturning.mockResolvedValue([])

    const { updateCompany } = await import("@/server/services/companies/update")

    expect(
      updateCompany("nonexistent", { description: "test" }),
    ).rejects.toThrow("Company not found")
  })
})
