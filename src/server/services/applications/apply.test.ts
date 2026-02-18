import { beforeEach, describe, expect, mock, test } from "bun:test"

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

// tx calls: 1=offer(for+limit), 2=company status(limit), 3=count(noLimit), 4=existing(limit)
// db calls after tx: 5=offer for notification(limit), 6=members(noLimit)
function makeSelect() {
  selectCallIdx++
  if (selectCallIdx === 1) {
    return { from: mockFromWithForAndLimit }
  }
  if (selectCallIdx === 2 || selectCallIdx === 4 || selectCallIdx === 5) {
    return { from: mockFromWithLimit }
  }
  return { from: mockFromNoLimit }
}

const dbMock = {
  select: makeSelect,
  insert: mockInsert,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: async (fn: (tx: any) => Promise<void>) => {
    await fn({
      select: makeSelect,
      insert: mockInsert,
    })
  },
}

mock.module("@/server/db", () => ({ db: dbMock }))

mock.module("@/server/services/applications/pipeline", () => ({
  appendTimelineEvent: mock(() => Promise.resolve({ eventId: "evt-1" })),
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
    mockSelectResults.push([])

    const { applyToOffer } = await import("@/server/services/applications/apply?fresh=1")

    await expect(applyToOffer("offer-1", "student-1")).rejects.toThrow("Offer not found")
  })

  test("should throw when positions are full", async () => {
    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Frontend Intern",
        status: "published",
        applicationDeadlineAt: null,
        maxPositions: 1,
      },
    ])
    mockSelectResults.push([{ status: "approved" }])
    mockSelectResults.push([{ value: 1 }])

    const { applyToOffer } = await import("@/server/services/applications/apply?fresh=2")

    await expect(applyToOffer("offer-1", "student-1")).rejects.toThrow(
      "All positions have been filled",
    )
  })

  test("should create application and notify company members", async () => {
    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Frontend Intern",
        status: "published",
        applicationDeadlineAt: null,
        maxPositions: 2,
      },
    ])
    mockSelectResults.push([{ status: "approved" }])
    mockSelectResults.push([{ value: 0 }])
    mockSelectResults.push([])
    mockSelectResults.push([{ companyId: "company-1", title: "Frontend Intern" }])
    mockSelectResults.push([{ userId: "member-1" }, { userId: "member-2" }])

    const { applyToOffer } = await import("@/server/services/applications/apply?fresh=3")

    const result = await applyToOffer("offer-1", "student-1", "Short cover letter")

    expect(result.applicationId).toBeDefined()
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })

  test("should throw when application deadline has passed", async () => {
    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Frontend Intern",
        status: "published",
        applicationDeadlineAt: new Date("2000-01-01T00:00:00.000Z"),
        maxPositions: 2,
      },
    ])

    const { applyToOffer } = await import("@/server/services/applications/apply?fresh=4")

    await expect(applyToOffer("offer-1", "student-1")).rejects.toThrow(
      "Offer application deadline has passed",
    )
  })
})
