import { beforeEach, describe, expect, mock, test } from "bun:test"

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

// Call 2: company members (no limit)
const mockWhere3 = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFrom3 = mock(() => ({ where: mockWhere3 }))

// Transaction select mocks
// Call 1: application lock (for update + limit)
// Call 2: offer lock (for update + limit)
// Call 3: existing placement check (limit)
// Call 4: validated placements count (no limit)

const txSelectResults: any[][] = []
let txSelectCallIdx = 0

const appLockLimit = mock(() => {
  const results = txSelectResults[txSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const appLockFor = mock(() => ({ limit: appLockLimit }))
const appLockWhere = mock(() => ({ for: appLockFor }))
const appLockFrom = mock(() => ({ where: appLockWhere }))

const txLimit1 = mock(() => {
  const results = txSelectResults[txSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const txFor1 = mock(() => ({ limit: txLimit1 }))
const txWhere1 = mock(() => ({ for: txFor1 }))
const txFrom1 = mock(() => ({ where: txWhere1 }))

const existingLimit = mock(() => {
  const results = txSelectResults[txSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const existingWhere = mock(() => ({ limit: existingLimit }))
const existingFrom = mock(() => ({ where: existingWhere }))

const txWhere2 = mock<() => Promise<any[]>>(() => {
  const results = txSelectResults[txSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const txInnerJoin2 = mock(() => ({ where: txWhere2 }))
const txFrom2 = mock(() => ({ innerJoin: txInnerJoin2 }))

// Transaction mocks

const txInsert = mock(() => ({}) as any)
let txValuesCallIdx = 0

const txValues = mock((): any => {
  txValuesCallIdx += 1
  if (txValuesCallIdx === 1) {
    return { onConflictDoNothing: txOnConflictDoNothing }
  }
  return Promise.resolve()
})

const txOnConflictDoNothing = mock(() => ({}) as any)
const txPlacementReturning = mock(() =>
  Promise.resolve([{ id: "placement-1" }]),
)

const txUpdate = mock(() => ({}) as any)

const txSet = mock(() => ({}) as any)

const txWhere = mock(() => ({}) as any)
const txUpdateReturning = mock(() => Promise.resolve([{ id: "app-1" }]))

interface Tx {
  select: () => { from: typeof appLockFrom | typeof txFrom1 | typeof existingFrom | typeof txFrom2 }
  insert: typeof txInsert
  update: typeof txUpdate
}

const mockTransaction = mock(async (fn: (tx: Tx) => Promise<void>) => {
  await fn({
    select: () => {
      txSelectCallIdx += 1
      if (txSelectCallIdx === 1) {
        return { from: appLockFrom }
      }
      if (txSelectCallIdx === 2) {
        return { from: txFrom1 }
      }
      if (txSelectCallIdx === 3) {
        return { from: existingFrom }
      }
      return { from: txFrom2 }
    },
    insert: txInsert,
    update: txUpdate,
  })
})

// Notification inserts

const mockInsert = mock(() => ({}) as any)

const mockValues = mock((): any => Promise.resolve())

const createNotificationMock = mock(() =>
  Promise.resolve({ id: "notification-1", skipped: false }),
)

const appendTimelineEventMock = mock(() =>
  Promise.resolve({ eventId: "evt-1" }),
)

function applyValidatePlacementMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => {
        selectCallIdx++
        if (selectCallIdx === 1) return { from: mockFromJoin }
        return { from: mockFrom3 }
      },
      transaction: mockTransaction,
      insert: mockInsert,
    },
  }))

  mock.module("@/server/services/notifications/create", () => ({
    createNotification: createNotificationMock,
  }))

  mock.module("@/server/services/applications/pipeline", () => ({
    appendTimelineEvent: appendTimelineEventMock,
  }))
}

let validatePlacementImportCounter = 0
async function importValidatePlacement() {
  validatePlacementImportCounter += 1
  return import(
    `@/server/services/placements/validate?test=${validatePlacementImportCounter}`
  )
}

describe("src/server/services/placements/validate", () => {
  beforeEach(() => {
    applyValidatePlacementMocks()

    selectCallIdx = 0
    txSelectCallIdx = 0
    mockSelectResults.length = 0
    txSelectResults.length = 0

    mockLimit1.mockClear()
    mockWhere1.mockClear()
    mockLeftJoin1.mockClear()
    mockJoin1.mockClear()
    mockJoin2.mockClear()
    mockJoin3.mockClear()
    mockFromJoin.mockClear()

    mockWhere3.mockClear()
    mockFrom3.mockClear()

    appLockLimit.mockClear()
    appLockFor.mockClear()
    appLockWhere.mockClear()
    appLockFrom.mockClear()

    txLimit1.mockClear()
    txFor1.mockClear()
    txWhere1.mockClear()
    txFrom1.mockClear()

    existingLimit.mockClear()
    existingWhere.mockClear()
    existingFrom.mockClear()

    txWhere2.mockClear()
    txInnerJoin2.mockClear()
    txFrom2.mockClear()

    txInsert.mockClear()
    txValues.mockClear()
    txOnConflictDoNothing.mockClear()
    txPlacementReturning.mockClear()
    txUpdate.mockClear()
    txSet.mockClear()
    txWhere.mockClear()
    txUpdateReturning.mockClear()
    mockTransaction.mockClear()
    txValuesCallIdx = 0

    mockInsert.mockClear()
    mockValues.mockClear()
    createNotificationMock.mockClear()
    appendTimelineEventMock.mockClear()

    mockFromJoin.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ innerJoin: mockJoin3 })
    mockJoin3.mockReturnValue({ leftJoin: mockLeftJoin1 })
    mockLeftJoin1.mockReturnValue({ where: mockWhere1 })
    mockWhere1.mockReturnValue({ limit: mockLimit1 })

    mockFrom3.mockReturnValue({ where: mockWhere3 })

    appLockFrom.mockReturnValue({ where: appLockWhere })
    appLockWhere.mockReturnValue({ for: appLockFor })
    appLockFor.mockReturnValue({ limit: appLockLimit })

    txFrom1.mockReturnValue({ where: txWhere1 })
    txWhere1.mockReturnValue({ for: txFor1 })
    txFor1.mockReturnValue({ limit: txLimit1 })

    existingFrom.mockReturnValue({ where: existingWhere })
    existingWhere.mockReturnValue({ limit: existingLimit })

    txFrom2.mockReturnValue({ innerJoin: txInnerJoin2 })
    txInnerJoin2.mockReturnValue({ where: txWhere2 })

    txInsert.mockReturnValue({ values: txValues })
    txOnConflictDoNothing.mockReturnValue({ returning: txPlacementReturning })
    txPlacementReturning.mockResolvedValue([{ id: "placement-1" }])
    txUpdate.mockReturnValue({ set: txSet })
    txSet.mockReturnValue({ where: txWhere })
    txWhere.mockReturnValue({ returning: txUpdateReturning })
    txUpdateReturning.mockResolvedValue([{ id: "app-1" }])

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
        offerStatus: "published",
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

    const { validatePlacement } = await importValidatePlacement()

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

  test("should throw when offer is not published", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        studentUserId: "stu-1",
        offerId: "offer-1",
        offerTitle: "Offer",
        offerInternshipType: "pfe",
        offerStatus: "closed",
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

    const { validatePlacement } = await importValidatePlacement()

    await expect(
      validatePlacement({
        applicationId: "app-1",
        adminUserId: "admin-1",
        adminRole: "super_admin",
        adminUniversityId: null,
        startDate: new Date("2030-01-01"),
        endDate: new Date("2030-02-01"),
      }),
    ).rejects.toThrow("This offer is not published and cannot be validated")
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
        offerStatus: "published",
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
    mockSelectResults.push([{ userId: "member-1" }])
    txSelectResults.push([{ id: "app-1" }])
    txSelectResults.push([{ id: "offer-1", status: "published", maxPositions: 2 }])
    txSelectResults.push([])
    txSelectResults.push([{ value: 0 }])

    const { validatePlacement } = await importValidatePlacement()
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

  test("should throw when the offer has reached max validated placements", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        studentUserId: "stu-1",
        offerId: "offer-1",
        offerTitle: "Offer",
        offerInternshipType: "pfe",
        offerStatus: "published",
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
    txSelectResults.push([{ id: "app-1" }])
    txSelectResults.push([{ id: "offer-1", status: "published", maxPositions: 1 }])
    txSelectResults.push([])
    txSelectResults.push([{ value: 1 }])

    const { validatePlacement } = await importValidatePlacement()

    await expect(
      validatePlacement({
        applicationId: "app-1",
        adminUserId: "admin-1",
        adminRole: "super_admin",
        adminUniversityId: null,
        startDate: new Date("2030-01-01"),
        endDate: new Date("2030-02-01"),
      }),
    ).rejects.toThrow("This offer has reached its maximum number of positions and cannot accept more placements")

    expect(txInsert).not.toHaveBeenCalled()
    expect(createNotificationMock).not.toHaveBeenCalled()
  })

  test("should throw when placement is inserted concurrently", async () => {
    mockSelectResults.push([
      {
        id: "app-1",
        status: "company_accepted",
        studentUserId: "stu-1",
        offerId: "offer-1",
        offerTitle: "Offer",
        offerInternshipType: "pfe",
        offerStatus: "published",
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
    txSelectResults.push([{ id: "app-1" }])
    txSelectResults.push([{ id: "offer-1", status: "published", maxPositions: 2 }])
    txSelectResults.push([])
    txSelectResults.push([{ value: 0 }])
    txPlacementReturning.mockResolvedValueOnce([])

    const { validatePlacement } = await importValidatePlacement()

    await expect(
      validatePlacement({
        applicationId: "app-1",
        adminUserId: "admin-1",
        adminRole: "super_admin",
        adminUniversityId: null,
        startDate: new Date("2030-01-01"),
        endDate: new Date("2030-02-01"),
      }),
    ).rejects.toThrow("A placement already exists for this application")
    expect(createNotificationMock).not.toHaveBeenCalled()
  })
})
