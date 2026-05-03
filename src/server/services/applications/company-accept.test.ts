import { beforeEach, describe, expect, mock, test } from "bun:test"

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

// For count queries and admin queries (calls 2+), support both innerJoin and where chains
const mockCountWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockCountInnerJoin = mock(() => ({ where: mockCountWhere }))
const mockFromCounts = mock(() => ({
  innerJoin: mockCountInnerJoin,
  where: mockCountWhere,
}))

const mockAdminsWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockLeftJoinAdmins = mock(() => ({ where: mockAdminsWhere }))
const mockFromAdmins = mock(() => ({
  leftJoin: mockLeftJoinAdmins,
  where: mockAdminsWhere,
}))

const mockUpdate = mock(() => ({}) as any)

const mockSet = mock(() => ({}) as any)

const mockUpdateWhere = mock(() => ({}) as any)
const mockUpdateReturning = mock(() => Promise.resolve([{ id: "app-1" }]))

const mockInsert = mock(() => ({}) as any)

const mockValues = mock((): any => Promise.resolve())

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      // Call 1: application join query (limit)
      // Call 2: validated placements count (innerJoin + where)
      // Call 3: company accepted count (where)
      // Call 4+: admins list (leftJoin + where)
      if (selectCallIdx === 1) return { from: mockFromWithTwoJoins }
      if (selectCallIdx === 2 || selectCallIdx === 3)
        return { from: mockFromCounts }
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

    mockFromCounts.mockClear()
    mockCountInnerJoin.mockClear()
    mockCountWhere.mockClear()

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

    mockFromCounts.mockReturnValue({
      innerJoin: mockCountInnerJoin,
      where: mockCountWhere,
    })
    mockCountInnerJoin.mockReturnValue({ where: mockCountWhere })

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
        offerStatus: "published",
        offerMaxPositions: 5,
        companyName: "Acme",
        studentUniversityId: "uni-1",
        studentDepartmentId: null,
      },
    ])
    mockSelectResults.push([{ value: 0 }])
    mockSelectResults.push([{ value: 0 }])
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

  test("should return idempotent success when already company_accepted and pipelineStage is accepted or validated", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        pipelineStage: "accepted",
        offerId: "offer-1",
        studentUserId: "student-1",
        offerTitle: "Offer 1",
        offerCompanyId: "company-1",
        offerStatus: "published",
        offerMaxPositions: 5,
        companyName: "Acme",
        studentUniversityId: "uni-1",
        studentDepartmentId: null,
      },
    ])

    const { companyAcceptApplication } = await importCompanyAcceptApplication()
    const result = await companyAcceptApplication(
      "app-1",
      "company-1",
      "actor-1",
    )

    expect(result.success).toBe(true)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should return idempotent success when already company_accepted and pipelineStage is validated", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        pipelineStage: "validated",
        offerId: "offer-1",
        studentUserId: "student-1",
        offerTitle: "Offer 1",
        offerCompanyId: "company-1",
        offerStatus: "published",
        offerMaxPositions: 5,
        companyName: "Acme",
        studentUniversityId: "uni-1",
        studentDepartmentId: null,
      },
    ])

    const { companyAcceptApplication } = await importCompanyAcceptApplication()
    const result = await companyAcceptApplication(
      "app-1",
      "company-1",
      "actor-1",
    )

    expect(result.success).toBe(true)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should sync pipelineStage when status is company_accepted but pipelineStage is not accepted", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        pipelineStage: "offer",
        offerId: "offer-1",
        studentUserId: "student-1",
        offerTitle: "Offer 1",
        offerCompanyId: "company-1",
        offerStatus: "published",
        offerMaxPositions: 5,
        companyName: "Acme",
        studentUniversityId: "uni-1",
        studentDepartmentId: null,
      },
    ])

    const { companyAcceptApplication } = await importCompanyAcceptApplication()
    const result = await companyAcceptApplication(
      "app-1",
      "company-1",
      "actor-1",
    )

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).not.toHaveBeenCalled()
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
        offerStatus: "published",
        offerMaxPositions: 5,
        companyName: "Acme",
        studentUniversityId: "uni-1",
        studentDepartmentId: null,
      },
    ])
    mockSelectResults.push([{ value: 0 }])
    mockSelectResults.push([{ value: 0 }])
    mockUpdateReturning.mockResolvedValueOnce([])

    const { companyAcceptApplication } = await importCompanyAcceptApplication()

    await expect(
      companyAcceptApplication("app-1", "company-1", "actor-1"),
    ).rejects.toThrow("Application was changed by another action")
    expect(createNotificationMock).not.toHaveBeenCalled()
  })
})
