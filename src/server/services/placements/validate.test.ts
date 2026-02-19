import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

// Call 1: app join query (limit)
const mockLimit1 = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockWhere1 = mock(() => ({ limit: mockLimit1 }))
const mockLeftJoin1 = mock(() => ({ where: mockWhere1 }))
const mockJoin3 = mock(() => ({ leftJoin: mockLeftJoin1 }))
const mockJoin2 = mock(() => ({ innerJoin: mockJoin3 }))
const mockJoin1 = mock(() => ({ innerJoin: mockJoin2 }))
const mockFromJoin = mock(() => ({ innerJoin: mockJoin1 }))

// Call 2: existing placement (limit)
const mockLimit2 = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockWhere2 = mock(() => ({ limit: mockLimit2 }))
const mockFrom2 = mock(() => ({ where: mockWhere2 }))

// Call 3: company members (no limit)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere3 = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFrom3 = mock(() => ({ where: mockWhere3 }))

// Transaction mocks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const txInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const txValues = mock((): any => Promise.resolve())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const txUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const txSet = mock(() => ({}) as any)
const txWhere = mock(() => Promise.resolve())

interface Tx {
  insert: typeof txInsert
  update: typeof txUpdate
}

const mockTransaction = mock(async (fn: (tx: Tx) => Promise<void>) => {
  await fn({
    insert: txInsert,
    update: txUpdate,
  })
})

// Notification inserts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      if (selectCallIdx === 1) return { from: mockFromJoin }
      if (selectCallIdx === 2) return { from: mockFrom2 }
      return { from: mockFrom3 }
    },
    transaction: mockTransaction,
    insert: mockInsert,
  },
}))

const createNotificationMock = mock(() =>
  Promise.resolve({ id: "notification-1", skipped: false }),
)

mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))

describe("src/server/services/placements/validate", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit1.mockClear()
    mockWhere1.mockClear()
    mockLeftJoin1.mockClear()
    mockJoin1.mockClear()
    mockJoin2.mockClear()
    mockJoin3.mockClear()
    mockFromJoin.mockClear()

    mockLimit2.mockClear()
    mockWhere2.mockClear()
    mockFrom2.mockClear()

    mockWhere3.mockClear()
    mockFrom3.mockClear()

    txInsert.mockClear()
    txValues.mockClear()
    txUpdate.mockClear()
    txSet.mockClear()
    txWhere.mockClear()
    mockTransaction.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()
    createNotificationMock.mockClear()

    mockFromJoin.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ innerJoin: mockJoin3 })
    mockJoin3.mockReturnValue({ leftJoin: mockLeftJoin1 })
    mockLeftJoin1.mockReturnValue({ where: mockWhere1 })
    mockWhere1.mockReturnValue({ limit: mockLimit1 })

    mockFrom2.mockReturnValue({ where: mockWhere2 })
    mockWhere2.mockReturnValue({ limit: mockLimit2 })

    mockFrom3.mockReturnValue({ where: mockWhere3 })

    txInsert.mockReturnValue({ values: txValues })
    txValues.mockResolvedValue(undefined)
    txUpdate.mockReturnValue({ set: txSet })
    txSet.mockReturnValue({ where: txWhere })
    txWhere.mockResolvedValue(undefined)

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    createNotificationMock.mockResolvedValue({
      id: "notification-1",
      skipped: false,
    })
  })

  test("should throw when application status is not company_accepted", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "applied",
        studentUserId: "stu-1",
        offerId: "offer-1",
        offerTitle: "Offer",
        offerInternshipType: "pfe",
        companyId: "company-1",
        companyName: "Acme",
        companyAddress: null,
        companyPhone: null,
        companyRepresentativeName: null,
        studentName: "Student",
        studentEmail: "s@example.com",
        universityId: null,
        studentDepartmentId: null,
      },
    ])

    const { validatePlacement } = await import("@/server/services/placements/validate")

    await expect(
      validatePlacement({
        applicationId: "app-1",
        adminUserId: "admin-1",
        adminRole: "super_admin",
        adminUniversityId: null,
        startDate: new Date("2030-01-01"),
        endDate: new Date("2030-02-01"),
      }),
    ).rejects.toThrow("Only company-accepted applications can be validated")
  })

  test("should create placement and send notifications", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        studentUserId: "stu-1",
        offerId: "offer-1",
        offerTitle: "Offer",
        offerInternshipType: "pfe",
        companyId: "company-1",
        companyName: "Acme",
        companyAddress: null,
        companyPhone: null,
        companyRepresentativeName: null,
        studentName: "Student",
        studentEmail: "s@example.com",
        universityId: null,
        studentDepartmentId: null,
      },
    ])
    mockSelectResults.push([])
    mockSelectResults.push([{ userId: "member-1" }])

    const { validatePlacement } = await import("@/server/services/placements/validate")
    const result = await validatePlacement({
      applicationId: "app-1",
      adminUserId: "admin-1",
      adminRole: "super_admin",
      adminUniversityId: null,
      startDate: new Date("2030-01-01"),
      endDate: new Date("2030-02-01"),
    })

    expect(result.success).toBe(true)
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockInsert).not.toHaveBeenCalled()
    expect(createNotificationMock).toHaveBeenCalledTimes(2)
  })
})
