import { beforeEach, describe, expect, mock, test } from "bun:test"

const txSelectResults: unknown[][] = []
let txSelectCallIdx = 0

function getCurrentSelectResults() {
  return txSelectResults[txSelectCallIdx - 1] ?? []
}

const txLimit = mock(() => Promise.resolve(getCurrentSelectResults()))
const txWhere = mock(() => ({ limit: txLimit }))
const txFrom = mock(() => ({ where: txWhere }))
const txSelect = mock(() => {
  txSelectCallIdx += 1
  return { from: txFrom }
})

const txDeleteReturningResults: unknown[][] = []
let txDeleteReturningCallIdx = 0

const txDeleteReturning = mock(() =>
  Promise.resolve(
    txDeleteReturningResults[txDeleteReturningCallIdx++] ?? [],
  ),
)
const txDeleteWhere = mock(() => ({ returning: txDeleteReturning }))
const txDelete = mock(() => ({ where: txDeleteWhere }))

const txUpdateReturningResults: unknown[][] = []
let txUpdateReturningCallIdx = 0

const txUpdateReturning = mock(() =>
  Promise.resolve(
    txUpdateReturningResults[txUpdateReturningCallIdx++] ?? [],
  ),
)
const txUpdateWhere = mock(() => ({ returning: txUpdateReturning }))
const txSet = mock(() => ({ where: txUpdateWhere }))
const txUpdate = mock(() => ({ set: txSet }))

const tx = {
  delete: txDelete,
  update: txUpdate,
  select: txSelect,
}

const mockTransaction = mock(
  async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx),
)

function applyDeleteOfferMocks() {
  mock.module("@/server/db", () => ({
    db: {
      transaction: mockTransaction,
    },
  }))
}

let deleteOfferImportCounter = 0
async function importDeleteOffer() {
  deleteOfferImportCounter += 1
  return (await import(
    `@/server/services/offers/delete?test=${deleteOfferImportCounter}`
  )) as typeof import("@/server/services/offers/delete")
}

describe("src/server/services/offers/delete", () => {
  beforeEach(() => {
    applyDeleteOfferMocks()

    txSelectResults.length = 0
    txSelectCallIdx = 0
    txDeleteReturningResults.length = 0
    txDeleteReturningCallIdx = 0
    txUpdateReturningResults.length = 0
    txUpdateReturningCallIdx = 0

    txLimit.mockClear()
    txWhere.mockClear()
    txFrom.mockClear()
    txSelect.mockClear()
    txDelete.mockClear()
    txDeleteWhere.mockClear()
    txDeleteReturning.mockClear()
    txUpdate.mockClear()
    txSet.mockClear()
    txUpdateWhere.mockClear()
    txUpdateReturning.mockClear()
    mockTransaction.mockClear()

    txFrom.mockReturnValue({ where: txWhere })
    txWhere.mockReturnValue({ limit: txLimit })

    txDelete.mockReturnValue({ where: txDeleteWhere })
    txDeleteWhere.mockReturnValue({ returning: txDeleteReturning })
    txDeleteReturning.mockImplementation(() =>
      Promise.resolve(
        txDeleteReturningResults[txDeleteReturningCallIdx++] ?? [],
      ),
    )

    txUpdate.mockReturnValue({ set: txSet })
    txSet.mockReturnValue({ where: txUpdateWhere })
    txUpdateWhere.mockReturnValue({ returning: txUpdateReturning })
    txUpdateReturning.mockImplementation(() =>
      Promise.resolve(
        txUpdateReturningResults[txUpdateReturningCallIdx++] ?? [],
      ),
    )

    mockTransaction.mockImplementation(async (callback) => callback(tx))
  })

  test("should hard delete draft offer", async () => {
    txDeleteReturningResults.push([{ id: "offer-1", status: "draft" }])

    const { deleteOffer } = await importDeleteOffer()

    const result = await deleteOffer("offer-1", "company-1")

    expect(result).toEqual({ offerId: "offer-1", deleted: true })
    expect(txDelete).toHaveBeenCalledTimes(1)
  })

  test("should return deleted false for an already closed offer", async () => {
    txDeleteReturningResults.push([])
    txSelectResults.push([{ status: "closed" }])

    const { deleteOffer } = await importDeleteOffer()

    const result = await deleteOffer("offer-1", "company-1")

    expect(result).toEqual({ offerId: "offer-1", deleted: false })
    expect(txUpdate).not.toHaveBeenCalled()
  })

  test("should reject deleting a published offer", async () => {
    txDeleteReturningResults.push([])
    txSelectResults.push([{ status: "published" }])

    const { deleteOffer } = await importDeleteOffer()

    await expect(deleteOffer("offer-1", "company-1")).rejects.toThrow(
      "Published offers must be closed instead of deleted",
    )
    expect(txUpdate).not.toHaveBeenCalled()
  })

  test("should throw when offer not found", async () => {
    txDeleteReturningResults.push([])
    txUpdateReturningResults.push([])
    txSelectResults.push([])

    const { deleteOffer } = await importDeleteOffer()

    expect(deleteOffer("nonexistent", "company-1")).rejects.toThrow(
      "Offer not found or access denied",
    )
  })
})
