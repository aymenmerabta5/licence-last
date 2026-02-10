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
const mockFromJoin = mock(() => ({ innerJoin: mockJoin1 }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
const mockUpdateWhere = mock(() => Promise.resolve())

// Notifications + companyMembers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockMembersWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromMembers = mock(() => ({ where: mockMembersWhere }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      // Call 1: app join query (limit)
      // Call 2: company members (no limit)
      if (selectCallIdx === 1) return { from: mockFromJoin }
      return { from: mockFromMembers }
    },
    update: mockUpdate,
    insert: mockInsert,
  },
}))

describe("src/server/services/placements/reject", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockWhereWithLimit.mockClear()
    mockJoin1.mockClear()
    mockJoin2.mockClear()
    mockFromJoin.mockClear()

    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()

    mockMembersWhere.mockClear()
    mockFromMembers.mockClear()

    mockFromJoin.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)

    mockFromMembers.mockReturnValue({ where: mockMembersWhere })
  })

  test("should reject placement and notify parties", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        studentUserId: "stu-1",
        offerId: "offer-1",
        offerTitle: "Offer",
        companyId: "company-1",
        companyName: "Acme",
      },
    ])
    mockSelectResults.push([{ userId: "member-1" }])

    const { rejectPlacement } = await import("./reject")
    const result = await rejectPlacement("app-1", "admin-1", "No papers")

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    // student notification + company notifications
    expect(mockInsert).toHaveBeenCalled()
  })
})
