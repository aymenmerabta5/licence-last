import { beforeEach, describe, expect, mock, test } from "bun:test"

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
      return { from: mockFromWithTwoJoins }
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

let companyRefuseImportCounter = 0
async function importCompanyRefuseApplication() {
  companyRefuseImportCounter += 1
  return import(
    `@/server/services/applications/company-refuse?fresh=${companyRefuseImportCounter}`
  )
}

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
    mockUpdateReturning.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()
    createNotificationMock.mockClear()

    mockFromWithTwoJoins.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

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

    const { companyRefuseApplication } = await importCompanyRefuseApplication()
    const result = await companyRefuseApplication(
      "app-1",
      "company-1",
      "actor-1",
      "Not a match",
    )

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockInsert).not.toHaveBeenCalled()
    expect(createNotificationMock).toHaveBeenCalledTimes(1)
  })

  test("should throw when application changes before refusal update", async () => {
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
    mockUpdateReturning.mockResolvedValueOnce([])

    const { companyRefuseApplication } = await importCompanyRefuseApplication()

    await expect(
      companyRefuseApplication("app-1", "company-1", "actor-1", "Not a match"),
    ).rejects.toThrow("Application was changed by another action")
    expect(createNotificationMock).not.toHaveBeenCalled()
  })
})
