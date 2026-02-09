import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any => [])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdateWhere = mock((): any => Promise.resolve())

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
  },
}))

describe("src/server/services/offers/update-status", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockLimit.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)
  })

  test("should publish a draft offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "draft" },
    ])

    const { updateOfferStatus } = await import("./update-status")

    const result = await updateOfferStatus("offer-1", "company-1", "publish")

    expect(result).toEqual({ offerId: "offer-1", newStatus: "published" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should close a published offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "published" },
    ])

    const { updateOfferStatus } = await import("./update-status")

    const result = await updateOfferStatus("offer-1", "company-1", "close")

    expect(result).toEqual({ offerId: "offer-1", newStatus: "closed" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should reject publishing a non-draft offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "published" },
    ])

    const { updateOfferStatus } = await import("./update-status")

    expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Only draft offers can be published")
  })

  test("should reject closing a non-published offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "draft" },
    ])

    const { updateOfferStatus } = await import("./update-status")

    expect(
      updateOfferStatus("offer-1", "company-1", "close"),
    ).rejects.toThrow("Only published offers can be closed")
  })

  test("should throw when offer not found", async () => {
    mockLimit.mockResolvedValue([])

    const { updateOfferStatus } = await import("./update-status")

    expect(
      updateOfferStatus("nonexistent", "company-1", "publish"),
    ).rejects.toThrow("Offer not found or access denied")
  })
})
