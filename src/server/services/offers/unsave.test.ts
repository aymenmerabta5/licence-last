import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDelete = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock<() => Promise<any[]>>(() => Promise.resolve([]))

mock.module("@/server/db", () => ({
  db: {
    delete: mockDelete,
  },
}))

describe("src/server/services/offers/unsave", () => {
  beforeEach(() => {
    mockDelete.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockDelete.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("returns removed=true when a saved offer is deleted", async () => {
    mockReturning.mockResolvedValue([{ offerId: "offer-1" }])

    const { unsaveOffer } = await import("@/server/services/offers/unsave")
    const result = await unsaveOffer("offer-1", "student-1")

    expect(result).toEqual({ offerId: "offer-1", removed: true })
  })

  test("returns removed=false when no row exists", async () => {
    mockReturning.mockResolvedValue([])

    const { unsaveOffer } = await import("@/server/services/offers/unsave")
    const result = await unsaveOffer("offer-1", "student-1")

    expect(result).toEqual({ offerId: "offer-1", removed: false })
  })
})
