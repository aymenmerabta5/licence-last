import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})

const mockFor = mock(() => ({ limit: mockLimit }))
const mockWhereWithForAndLimit = mock(() => ({ for: mockFor }))
const mockFromWithForAndLimit = mock(() => ({ where: mockWhereWithForAndLimit }))

const mockWhereWithLimit = mock(() => ({ limit: mockLimit }))
const mockFromWithLimit = mock(() => ({ where: mockWhereWithLimit }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhereNoLimit = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromNoLimit = mock(() => ({ where: mockWhereNoLimit }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())

// The tx object used inside db.transaction(async (tx) => { ... })
// tx calls (inside transaction): 1=offer(for+limit), 2=count(noLimit), 3=existing(limit), 4=insert
// db calls (after transaction): 5=offer re-fetch(limit), 6=members(noLimit), 7=insert notifications
function makeSelect() {
  selectCallIdx++
  // Call 1: offer query inside tx (where → for → limit)
  if (selectCallIdx === 1) {
    return { from: mockFromWithForAndLimit }
  }
  // Call 3: existing app check (where → limit), Call 4: offer re-fetch after tx (where → limit)
  if (selectCallIdx === 3 || selectCallIdx === 4) {
    return { from: mockFromWithLimit }
  }
  // Call 2: count (no limit), Call 5: members (no limit)
  return { from: mockFromNoLimit }
}

const dbMock = {
  select: makeSelect,
  insert: mockInsert,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: async (fn: (tx: any) => Promise<void>) => {
    // tx has the same interface as db for queries
    await fn({
      select: makeSelect,
      insert: mockInsert,
    })
  },
}

mock.module("@/server/db", () => ({ db: dbMock }))

// Mock the pipeline module (appendTimelineEvent is called after the transaction)
mock.module("@/server/services/applications/pipeline", () => ({
  appendTimelineEvent: mock(() => Promise.resolve()),
}))

describe("src/server/services/applications/apply", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockFor.mockClear()
    mockWhereWithForAndLimit.mockClear()
    mockFromWithForAndLimit.mockClear()
    mockWhereWithLimit.mockClear()
    mockFromWithLimit.mockClear()
    mockWhereNoLimit.mockClear()
    mockFromNoLimit.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()

    mockFromWithForAndLimit.mockReturnValue({ where: mockWhereWithForAndLimit })
    mockWhereWithForAndLimit.mockReturnValue({ for: mockFor })
    mockFor.mockReturnValue({ limit: mockLimit })

    mockFromWithLimit.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    mockFromNoLimit.mockReturnValue({ where: mockWhereNoLimit })

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should throw when offer does not exist", async () => {
    mockSelectResults.push([]) // tx select 1: no offer found

    const { applyToOffer } = await import("@/server/services/applications/apply")

    await expect(applyToOffer("offer-1", "student-1")).rejects.toThrow(
      "Offer not found",
    )
  })

  test("should throw when positions are full", async () => {
    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Frontend Intern",
        status: "published",
        closesAt: null,
        maxPositions: 1,
      },
    ]) // tx select 1: offer
    mockSelectResults.push([{ value: 1 }]) // tx select 2: count = 1 (full)

    const { applyToOffer } = await import("@/server/services/applications/apply")

    await expect(applyToOffer("offer-1", "student-1")).rejects.toThrow(
      "All positions have been filled",
    )
  })

  test("should create application and notify company members", async () => {
    // tx select 1: offer exists and is published
    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Frontend Intern",
        status: "published",
        closesAt: null,
        maxPositions: 2,
      },
    ])
    // tx select 2: validated count = 0
    mockSelectResults.push([{ value: 0 }])
    // tx select 3: no existing application
    mockSelectResults.push([])
    // tx insert: application (handled by mockInsert)
    // appendTimelineEvent (mocked, no db call)

    // db select 4: re-fetch offer for notification context
    mockSelectResults.push([
      { companyId: "company-1", title: "Frontend Intern" },
    ])
    // db select 5: company members
    mockSelectResults.push([{ userId: "member-1" }, { userId: "member-2" }])

    const { applyToOffer } = await import("@/server/services/applications/apply")

    const result = await applyToOffer(
      "offer-1",
      "student-1",
      "Short cover letter",
    )

    expect(result.applicationId).toBeDefined()
    // 1 insert inside tx (application) + 1 insert outside tx (notifications)
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })
})
