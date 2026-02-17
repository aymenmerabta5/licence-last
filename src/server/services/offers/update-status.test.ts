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
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    const result = await updateOfferStatus("offer-1", "company-1", "publish")

    expect(result).toEqual({ offerId: "offer-1", newStatus: "published" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should close a published offer", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "published",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    const result = await updateOfferStatus("offer-1", "company-1", "close")

    expect(result).toEqual({ offerId: "offer-1", newStatus: "closed" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should reject publishing a non-draft offer", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "published",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Only draft offers can be published")
  })

  test("should reject closing a non-published offer", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    await expect(
      updateOfferStatus("offer-1", "company-1", "close"),
    ).rejects.toThrow("Only published offers can be closed")
  })

  test("should throw when offer not found", async () => {
    mockLimit.mockResolvedValue([])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    await expect(
      updateOfferStatus("nonexistent", "company-1", "publish"),
    ).rejects.toThrow("Offer not found or access denied")
  })

  test("should reject publishing when expected period is incomplete", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: new Date("2030-01-10T00:00:00.000Z"),
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Expected start and end dates must both be provided")
  })

  test("should reject publishing when expected period is invalid", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: new Date("2030-01-10T00:00:00.000Z"),
        expectedEndDate: new Date("2030-01-10T00:00:00.000Z"),
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Expected start date must be before expected end date")
  })

  test("should reject publishing when deadline is after expected start", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: new Date("2030-01-12T00:00:00.000Z"),
        expectedStartDate: new Date("2030-01-10T00:00:00.000Z"),
        expectedEndDate: new Date("2030-02-10T00:00:00.000Z"),
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Application deadline must be before expected start date")
  })

  test("should reject publishing when deadline is in the past", async () => {
    mockLimit.mockResolvedValue([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: new Date("2000-01-01T00:00:00.000Z"),
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import("@/server/services/offers/update-status")

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Application deadline cannot be in the past when publishing")
  })
})
