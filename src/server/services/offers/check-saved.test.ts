import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelect = mock(() => ({}) as any)

const mockFrom = mock(() => ({}) as any)

const mockWhere = mock(() => ({}) as any)

const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))

function applyCheckSavedMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

let checkSavedImportCounter = 0
async function importCheckSaved() {
  checkSavedImportCounter += 1
  return (await import(
    `@/server/services/offers/check-saved?test=${checkSavedImportCounter}`
  )) as typeof import("@/server/services/offers/check-saved")
}

describe("src/server/services/offers/check-saved", () => {
  beforeEach(() => {
    applyCheckSavedMocks()

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

    const { checkOfferSaved } = await importCheckSaved()
    const result = await checkOfferSaved("offer-1", "student-1")

    expect(result).toEqual({ saved: true })
  })

  test("returns saved=false when row does not exist", async () => {
    mockLimit.mockResolvedValue([])

    const { checkOfferSaved } = await importCheckSaved()
    const result = await checkOfferSaved("offer-1", "student-1")

    expect(result).toEqual({ saved: false })
  })
})
