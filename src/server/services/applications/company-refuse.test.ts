import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})

const mockWhereWithLimit = mock(() => ({ limit: mockLimit }))
const mockJoin2 = mock(() => ({ where: mockWhereWithLimit }))
const mockJoin1 = mock(() => ({ innerJoin: mockJoin2 }))
const mockFromWithTwoJoins = mock(() => ({ innerJoin: mockJoin1 }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
const mockUpdateWhere = mock(() => Promise.resolve())

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      return { from: mockFromWithTwoJoins }
    },
    update: mockUpdate,
    insert: mockInsert,
  },
}))

mock.module("@/server/services/applications/pipeline", () => ({
  appendTimelineEvent: mock(() => Promise.resolve({ eventId: "evt-1" })),
}))

describe("src/server/services/applications/company-refuse", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockWhereWithLimit.mockClear()
    mockJoin1.mockClear()
    mockJoin2.mockClear()
    mockFromWithTwoJoins.mockClear()

    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()

    mockFromWithTwoJoins.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should refuse an application and notify student", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "applied",
        offerId: "offer-1",
        studentUserId: "student-1",
        offerTitle: "Offer 1",
        offerCompanyId: "company-1",
        companyName: "Acme",
      },
    ])

    const { companyRefuseApplication } = await import("./company-refuse")
    const result = await companyRefuseApplication(
      "app-1",
      "company-1",
      "actor-1",
      "Not a match",
    )

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    // 1 insert: student notification (timeline event is via appendTimelineEvent, mocked)
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
