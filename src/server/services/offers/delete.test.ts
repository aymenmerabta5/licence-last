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
const mockDeleteFn = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDeleteWhere = mock((): any => Promise.resolve())

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdateWhere = mock((): any => Promise.resolve())

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    delete: mockDeleteFn,
    update: mockUpdate,
  },
}))

describe("src/server/services/offers/delete", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockLimit.mockClear()
    mockDeleteFn.mockClear()
    mockDeleteWhere.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })

    mockDeleteFn.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)
  })

  test("should hard delete draft offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "draft" },
    ])

    const { deleteOffer } = await import("./delete")

    const result = await deleteOffer("offer-1", "company-1")

    expect(result).toEqual({ offerId: "offer-1", deleted: true })
    expect(mockDeleteFn).toHaveBeenCalledTimes(1)
  })

  test("should soft close published offer", async () => {
    mockLimit.mockResolvedValue([
      { id: "offer-1", companyId: "company-1", status: "published" },
    ])

    const { deleteOffer } = await import("./delete")

    const result = await deleteOffer("offer-1", "company-1")

    expect(result).toEqual({ offerId: "offer-1", deleted: false })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when offer not found", async () => {
    mockLimit.mockResolvedValue([])

    const { deleteOffer } = await import("./delete")

    expect(
      deleteOffer("nonexistent", "company-1"),
    ).rejects.toThrow("Offer not found or access denied")
  })
})
