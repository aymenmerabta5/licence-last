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
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTxUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTxSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTxUpdateWhere = mock((): any => Promise.resolve())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDelete = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDeleteWhere = mock((): any => Promise.resolve())

const mockTx = {
  update: mockTxUpdate,
  delete: mockDelete,
  insert: mockInsert,
}

const mockTransaction = mock(async (fn: (tx: typeof mockTx) => Promise<void>) => {
  await fn(mockTx)
})

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    transaction: mockTransaction,
  },
}))

mock.module("@/server/services/skills/validate", () => ({
  validateSkillTagIds: mock(() => Promise.resolve()),
}))

describe("src/server/services/offers/update", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockLimit.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockTxUpdate.mockClear()
    mockTxSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()
    mockTransaction.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockTxUpdate.mockReturnValue({ set: mockTxSet })
    mockTxSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockResolvedValue(undefined)
    mockDelete.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)

    mockTransaction.mockImplementation(async (fn) => {
      await fn(mockTx)
    })
  })

  test("should update offer and sync skills", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "draft" },
    ])

    const { updateOffer } = await import("@/server/services/offers/update")

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

    const { updateOffer } = await import("@/server/services/offers/update")

    expect(
      updateOffer("offer-1", "company-1", { title: "New" }),
    ).rejects.toThrow("Cannot update a closed offer")
  })

  test("should throw when offer not found or wrong company", async () => {
    mockLimit.mockResolvedValue([])

    const { updateOffer } = await import("@/server/services/offers/update")

    expect(
      updateOffer("offer-1", "wrong-company", { title: "New" }),
    ).rejects.toThrow("Offer not found or access denied")
  })
})
