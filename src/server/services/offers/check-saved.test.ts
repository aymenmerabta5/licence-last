import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/offers/check-saved", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("returns saved=true when row exists", async () => {
    mockLimit.mockResolvedValue([{ offerId: "offer-1" }])

    const { checkOfferSaved } = await import(
      "@/server/services/offers/check-saved"
    )
    const result = await checkOfferSaved("offer-1", "student-1")

    expect(result).toEqual({ saved: true })
  })

  test("returns saved=false when row does not exist", async () => {
    mockLimit.mockResolvedValue([])

    const { checkOfferSaved } = await import(
      "@/server/services/offers/check-saved"
    )
    const result = await checkOfferSaved("offer-1", "student-1")

    expect(result).toEqual({ saved: false })
  })
})
