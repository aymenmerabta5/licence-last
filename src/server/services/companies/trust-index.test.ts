import { describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/companies/trust-index getCompanyTrustIndex", () => {
  test("should throw when company does not exist", async () => {
    const { getCompanyTrustIndex } = await import("./trust-index")

    await expect(getCompanyTrustIndex("missing-company")).rejects.toThrow(
      "Company not found",
    )
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })
})
