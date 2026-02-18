import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInnerJoin = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockOnConflictDoNothing = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock<() => Promise<any[]>>(() => Promise.resolve([]))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}))

describe("src/server/services/offers/save", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockInnerJoin.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockOnConflictDoNothing.mockClear()
    mockReturning.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing })
    mockOnConflictDoNothing.mockReturnValue({ returning: mockReturning })
  })

  test("saves a published offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", status: "published", companyStatus: "approved" },
    ])
    mockReturning.mockResolvedValue([{ offerId: "offer-1" }])

    const { saveOffer } = await import("@/server/services/offers/save")
    const result = await saveOffer("offer-1", "student-1")

    expect(result).toEqual({ offerId: "offer-1", saved: true })
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("returns saved=false when offer is already saved", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", status: "published", companyStatus: "approved" },
    ])
    mockReturning.mockResolvedValue([])

    const { saveOffer } = await import("@/server/services/offers/save")
    const result = await saveOffer("offer-1", "student-1")

    expect(result).toEqual({ offerId: "offer-1", saved: false })
  })

  test("throws when offer does not exist", async () => {
    mockLimit.mockResolvedValue([])

    const { saveOffer } = await import("@/server/services/offers/save")

    await expect(saveOffer("missing", "student-1")).rejects.toThrow("Offer not found")
  })

  test("throws when offer is not published", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", status: "draft", companyStatus: "approved" },
    ])

    const { saveOffer } = await import("@/server/services/offers/save")

    await expect(saveOffer("offer-1", "student-1")).rejects.toThrow(
      "Only published offers can be saved",
    )
  })

  test("throws when company is not approved", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", status: "published", companyStatus: "suspended" },
    ])

    const { saveOffer } = await import("@/server/services/offers/save")

    await expect(saveOffer("offer-1", "student-1")).rejects.toThrow(
      "Only published offers can be saved",
    )
  })
})
