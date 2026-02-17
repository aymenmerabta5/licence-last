import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})

const mockWhereWithLimit = mock(() => ({ limit: mockLimit }))
const mockLeftJoin = mock(() => ({ where: mockWhereWithLimit }))
const mockJoin3 = mock(() => ({ leftJoin: mockLeftJoin }))
const mockJoin2 = mock(() => ({ innerJoin: mockJoin3 }))
const mockJoin1 = mock(() => ({ innerJoin: mockJoin2 }))
const mockFromWithTwoJoins = mock(() => ({ innerJoin: mockJoin1 }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAdminsWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromAdmins = mock(() => ({ where: mockAdminsWhere }))

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
      // Call 1: application join query (limit)
      // Call 2: admins list (no limit)
      if (selectCallIdx === 1) return { from: mockFromWithTwoJoins }
      return { from: mockFromAdmins }
    },
    update: mockUpdate,
    insert: mockInsert,
  },
}))

mock.module("@/server/services/applications/pipeline", () => ({
  appendTimelineEvent: mock(() => Promise.resolve({ eventId: "evt-1" })),
}))

describe("src/server/services/applications/company-accept", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockWhereWithLimit.mockClear()
    mockLeftJoin.mockClear()
    mockJoin1.mockClear()
    mockJoin2.mockClear()
    mockJoin3.mockClear()
    mockFromWithTwoJoins.mockClear()

    mockAdminsWhere.mockClear()
    mockFromAdmins.mockClear()

    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()

    mockFromWithTwoJoins.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ innerJoin: mockJoin3 })
    mockJoin3.mockReturnValue({ leftJoin: mockLeftJoin })
    mockLeftJoin.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    mockFromAdmins.mockReturnValue({ where: mockAdminsWhere })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should throw when application is not found", async () => {
    mockSelectResults.push([])

    const { companyAcceptApplication } = await import("@/server/services/applications/company-accept")
    await expect(
      companyAcceptApplication("app-1", "company-1", "actor-1"),
    ).rejects.toThrow("Application not found")
  })

  test("should update status and notify admins", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "applied",
        offerId: "offer-1",
        studentUserId: "student-1",
        offerTitle: "Offer 1",
        offerCompanyId: "company-1",
        companyName: "Acme",
        studentUniversityId: "uni-1",
        studentDepartmentId: null,
      },
    ])
    mockSelectResults.push([{ id: "admin-1" }, { id: "admin-2" }])

    const { companyAcceptApplication } = await import("@/server/services/applications/company-accept")
    const result = await companyAcceptApplication(
      "app-1",
      "company-1",
      "actor-1",
    )

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    // 2 inserts: student notification + admin notifications (timeline is via appendTimelineEvent, mocked)
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })
})
