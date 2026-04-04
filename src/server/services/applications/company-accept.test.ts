import { beforeEach, describe, expect, mock, test } from "bun:test"

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
const mockLeftJoinAdmins = mock(() => ({ where: mockAdminsWhere }))
const mockFromAdmins = mock(() => ({
  leftJoin: mockLeftJoinAdmins,
  where: mockAdminsWhere,
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdateWhere = mock(() => ({}) as any)
const mockUpdateReturning = mock(() => Promise.resolve([{ id: "app-1" }]))

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

const createNotificationMock = mock(() =>
  Promise.resolve({ id: "notification-1", skipped: false }),
)

mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))

let companyAcceptImportCounter = 0
async function importCompanyAcceptApplication() {
  companyAcceptImportCounter += 1
  return import(
    `@/server/services/applications/company-accept?fresh=${companyAcceptImportCounter}`
  )
}

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
    mockLeftJoinAdmins.mockClear()
    mockFromAdmins.mockClear()

    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()
    mockUpdateReturning.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()
    createNotificationMock.mockClear()

    mockFromWithTwoJoins.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ innerJoin: mockJoin3 })
    mockJoin3.mockReturnValue({ leftJoin: mockLeftJoin })
    mockLeftJoin.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    mockFromAdmins.mockReturnValue({
      leftJoin: mockLeftJoinAdmins,
      where: mockAdminsWhere,
    })
    mockLeftJoinAdmins.mockReturnValue({ where: mockAdminsWhere })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockReturnValue({ returning: mockUpdateReturning })
    mockUpdateReturning.mockResolvedValue([{ id: "app-1" }])

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    createNotificationMock.mockResolvedValue({
      id: "notification-1",
      skipped: false,
    })
  })

  test("should throw when application is not found", async () => {
    mockSelectResults.push([])

    const { companyAcceptApplication } = await importCompanyAcceptApplication()
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

    const { companyAcceptApplication } = await importCompanyAcceptApplication()
    const result = await companyAcceptApplication(
      "app-1",
      "company-1",
      "actor-1",
    )

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockInsert).not.toHaveBeenCalled()
    expect(createNotificationMock).toHaveBeenCalledTimes(3)
  })

  test("should throw when application changes before update", async () => {
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
    mockUpdateReturning.mockResolvedValueOnce([])

    const { companyAcceptApplication } = await importCompanyAcceptApplication()

    await expect(
      companyAcceptApplication("app-1", "company-1", "actor-1"),
    ).rejects.toThrow("Application was changed by another action")
    expect(createNotificationMock).not.toHaveBeenCalled()
  })
})
