import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any => [])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTxUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTxSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTxUpdateWhere = mock(() => ({ returning: mockTxUpdateReturning }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTxUpdateReturning = mock((): any => Promise.resolve([{ id: "offer-1" }]))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDelete = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDeleteWhere = mock((): any => Promise.resolve())

const mockTx = {
  update: mockTxUpdate,
  delete: mockDelete,
  insert: mockInsert,
}

const mockTransaction = mock(
  async (fn: (tx: typeof mockTx) => Promise<void>) => {
    await fn(mockTx)
  },
)
const mockValidateSkillTagIds = mock(() => Promise.resolve())

function applyUpdateOfferMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      transaction: mockTransaction,
    },
  }))

  mock.module("@/server/services/skills/validate", () => ({
    validateSkillTagIds: mockValidateSkillTagIds,
  }))
}

let updateOfferImportCounter = 0
async function importUpdateOffer() {
  updateOfferImportCounter += 1
  return (await import(
    `@/server/services/offers/update?test=${updateOfferImportCounter}`
  )) as typeof import("@/server/services/offers/update")
}

describe("src/server/services/offers/update", () => {
  beforeEach(() => {
    applyUpdateOfferMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockLimit.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockTxUpdate.mockClear()
    mockTxSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockTxUpdateReturning.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()
    mockTransaction.mockClear()
    mockValidateSkillTagIds.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockTxUpdate.mockReturnValue({ set: mockTxSet })
    mockTxSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockReturnValue({ returning: mockTxUpdateReturning })
    mockTxUpdateReturning.mockResolvedValue([{ id: "offer-1" }])
    mockDelete.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)
    mockValidateSkillTagIds.mockResolvedValue(undefined)

    mockTransaction.mockImplementation(async (fn) => {
      await fn(mockTx)
    })
  })

  test("should update offer and sync skills", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "draft" },
    ])

    const { updateOffer } = await importUpdateOffer()

    const result = await updateOffer("offer-1", "company-1", {
      title: "Updated Title",
      skillTagIds: ["skill-3"],
    })

    expect(result).toEqual({ offerId: "offer-1" })
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
  })

  test("should throw on closed offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "closed" },
    ])

    const { updateOffer } = await importUpdateOffer()

    expect(
      updateOffer("offer-1", "company-1", { title: "New" }),
    ).rejects.toThrow("Cannot update a closed offer")
  })

  test("should throw when offer not found or wrong company", async () => {
    mockLimit.mockResolvedValue([])

    const { updateOffer } = await importUpdateOffer()

    expect(
      updateOffer("offer-1", "wrong-company", { title: "New" }),
    ).rejects.toThrow("Offer not found or access denied")
  })
})
