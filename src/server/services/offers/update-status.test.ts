import { beforeEach, describe, expect, mock, test } from "bun:test"

const txSelectResults: unknown[][] = []
let txSelectCallIdx = 0

function getCurrentSelectResults() {
  return txSelectResults[txSelectCallIdx - 1] ?? []
}

const txLimit = mock(() => Promise.resolve(getCurrentSelectResults()))
const txForUpdate = mock(() => ({ limit: txLimit }))
const txWhereWithLock = mock(() => ({ for: txForUpdate }))
const txFromWithLock = mock(() => ({ where: txWhereWithLock }))

const txWhere = mock(() => Promise.resolve(getCurrentSelectResults()))
const txFrom = mock(() => ({ where: txWhere }))

const txSelect = mock(() => {
  txSelectCallIdx += 1

  if (txSelectCallIdx === 1) {
    return { from: txFromWithLock }
  }

  return { from: txFrom }
})

const txUpdateReturningResults: unknown[][] = []
let txUpdateReturningCallIdx = 0

const txUpdateReturning = mock(() =>
  Promise.resolve(txUpdateReturningResults[txUpdateReturningCallIdx++] ?? []),
)
const txUpdateWhere = mock(() => ({ returning: txUpdateReturning }))
const txSet = mock(() => ({ where: txUpdateWhere }))
const txUpdate = mock(() => ({ set: txSet }))

const tx = {
  select: txSelect,
  update: txUpdate,
}

const mockTransaction = mock(
  async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx),
)

mock.module("@/server/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}))

const createNotificationMock = mock(async () => ({}))
mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))
mock.module("@/server/logging", () => ({
  createModuleLogger: () => ({
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  }),
}))

describe("src/server/services/offers/update-status", () => {
  beforeEach(() => {
    txSelectResults.length = 0
    txSelectCallIdx = 0
    txUpdateReturningResults.length = 0
    txUpdateReturningCallIdx = 0

    txLimit.mockClear()
    txForUpdate.mockClear()
    txWhereWithLock.mockClear()
    txFromWithLock.mockClear()
    txWhere.mockClear()
    txFrom.mockClear()
    txSelect.mockClear()
    txUpdate.mockClear()
    txSet.mockClear()
    txUpdateWhere.mockClear()
    txUpdateReturning.mockClear()
    mockTransaction.mockClear()
    createNotificationMock.mockClear()

    txFromWithLock.mockReturnValue({ where: txWhereWithLock })
    txWhereWithLock.mockReturnValue({ for: txForUpdate })
    txForUpdate.mockReturnValue({ limit: txLimit })
    txFrom.mockReturnValue({ where: txWhere })
    txWhere.mockImplementation(() => Promise.resolve(getCurrentSelectResults()))

    txUpdate.mockReturnValue({ set: txSet })
    txSet.mockReturnValue({ where: txUpdateWhere })
    txUpdateWhere.mockReturnValue({ returning: txUpdateReturning })
    txUpdateReturning.mockImplementation(() =>
      Promise.resolve(
        txUpdateReturningResults[txUpdateReturningCallIdx++] ?? [],
      ),
    )
    createNotificationMock.mockResolvedValue({})
    mockTransaction.mockImplementation(async (callback) => callback(tx))
  })

  test("should publish a draft offer", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])
    txUpdateReturningResults.push([{ id: "offer-1" }])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    const result = await updateOfferStatus("offer-1", "company-1", "publish")

    expect(result).toEqual({ offerId: "offer-1", newStatus: "published" })
    expect(txUpdate).toHaveBeenCalledTimes(1)
  })

  test("should close a published offer", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "published",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])
    txSelectResults.push([{ id: "int-1", studentUserId: "student-1" }])
    txUpdateReturningResults.push([{ id: "offer-1" }])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    const result = await updateOfferStatus("offer-1", "company-1", "close")

    expect(result).toEqual({ offerId: "offer-1", newStatus: "closed" })
    expect(txUpdate).toHaveBeenCalledTimes(2)
    expect(createNotificationMock).toHaveBeenCalledWith({
      userId: "student-1",
      type: "interview_cancelled",
      payload: {
        interviewId: "int-1",
        offerId: "offer-1",
        reason: "offer_closed",
      },
    })
  })

  test("should reject publishing a non-draft offer", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "published",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Only draft offers can be published")
  })

  test("should reject closing a non-published offer", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    await expect(
      updateOfferStatus("offer-1", "company-1", "close"),
    ).rejects.toThrow("Only published offers can be closed")
  })

  test("should throw when offer not found", async () => {
    txSelectResults.push([])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    await expect(
      updateOfferStatus("nonexistent", "company-1", "publish"),
    ).rejects.toThrow("Offer not found or access denied")
  })

  test("should reject publishing when expected period is incomplete", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: new Date("2030-01-10T00:00:00.000Z"),
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Expected start and end dates must both be provided")
  })

  test("should reject publishing when expected period is invalid", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: null,
        expectedStartDate: new Date("2030-01-10T00:00:00.000Z"),
        expectedEndDate: new Date("2030-01-10T00:00:00.000Z"),
      },
    ])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Expected start date must be before expected end date")
  })

  test("should reject publishing when deadline is after expected start", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: new Date("2030-01-12T00:00:00.000Z"),
        expectedStartDate: new Date("2030-01-10T00:00:00.000Z"),
        expectedEndDate: new Date("2030-02-10T00:00:00.000Z"),
      },
    ])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow("Application deadline must be before expected start date")
  })

  test("should reject publishing when deadline is in the past", async () => {
    txSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        status: "draft",
        applicationDeadlineAt: new Date("2000-01-01T00:00:00.000Z"),
        expectedStartDate: null,
        expectedEndDate: null,
      },
    ])

    const { updateOfferStatus } = await import(
      "@/server/services/offers/update-status"
    )

    await expect(
      updateOfferStatus("offer-1", "company-1", "publish"),
    ).rejects.toThrow(
      "Application deadline cannot be in the past when publishing",
    )
  })
})
