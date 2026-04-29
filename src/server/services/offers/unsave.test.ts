import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockDelete = mock(() => ({}) as any)

const mockWhere = mock(() => ({}) as any)

const mockReturning = mock<() => Promise<any[]>>(() => Promise.resolve([]))

function applyUnsaveOfferMocks() {
  mock.module("@/server/db", () => ({
    db: {
      delete: mockDelete,
    },
  }))
}

let unsaveOfferImportCounter = 0
async function importUnsaveOffer() {
  unsaveOfferImportCounter += 1
  return (await import(
    `@/server/services/offers/unsave?test=${unsaveOfferImportCounter}`
  )) as typeof import("@/server/services/offers/unsave")
}

describe("src/server/services/offers/unsave", () => {
  beforeEach(() => {
    applyUnsaveOfferMocks()

    mockDelete.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockDelete.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("returns removed=true when a saved offer is deleted", async () => {
    mockReturning.mockResolvedValue([{ offerId: "offer-1" }])

    const { unsaveOffer } = await importUnsaveOffer()
    const result = await unsaveOffer("offer-1", "student-1")

    expect(result).toEqual({ offerId: "offer-1", removed: true })
  })

  test("returns removed=false when no row exists", async () => {
    mockReturning.mockResolvedValue([])

    const { unsaveOffer } = await importUnsaveOffer()
    const result = await unsaveOffer("offer-1", "student-1")

    expect(result).toEqual({ offerId: "offer-1", removed: false })
  })
})
