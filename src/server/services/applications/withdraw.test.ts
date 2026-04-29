import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})

const mockInnerJoin = mock(() => ({ where: mockWhere }))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ innerJoin: mockInnerJoin }))

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
      return { from: mockFrom }
    },
    update: mockUpdate,
    insert: mockInsert,
  },
}))

mock.module("@/server/services/applications/pipeline", () => ({
  appendTimelineEvent: mock(() => Promise.resolve({ eventId: "evt-1" })),
}))

let withdrawImportCounter = 0
async function importWithdrawApplication() {
  withdrawImportCounter += 1
  return import(
    `@/server/services/applications/withdraw?fresh=${withdrawImportCounter}`
  )
}

describe("src/server/services/applications/withdraw", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockInnerJoin.mockClear()
    mockWhere.mockClear()
    mockFrom.mockClear()

    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()
    mockUpdateReturning.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()

    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockReturnValue({ returning: mockUpdateReturning })
    mockUpdateReturning.mockResolvedValue([{ id: "app-1" }])
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should throw when application is not found", async () => {
    mockSelectResults.push([])
    const { withdrawApplication } = await importWithdrawApplication()
    await expect(withdrawApplication("app-1", "student-1")).rejects.toThrow(
      "Application not found",
    )
  })

  test("should throw when application is not in applied status", async () => {
    mockSelectResults.push([
      { id: "app-1", studentUserId: "student-1", status: "company_accepted" },
    ])
    const { withdrawApplication } = await importWithdrawApplication()
    await expect(withdrawApplication("app-1", "student-1")).rejects.toThrow(
      "Only pending applications can be withdrawn",
    )
  })

  test("should update status to withdrawn", async () => {
    mockSelectResults.push([
      { id: "app-1", studentUserId: "student-1", status: "applied" },
    ])
    const { withdrawApplication } = await importWithdrawApplication()
    const result = await withdrawApplication("app-1", "student-1")
    expect(result.newStatus).toBe("withdrawn")
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    // withdraw has no direct db.insert — only appendTimelineEvent (mocked)
    expect(mockInsert).toHaveBeenCalledTimes(0)
  })

  test("should throw when application changes before withdraw update", async () => {
    mockSelectResults.push([
      { id: "app-1", studentUserId: "student-1", status: "applied" },
    ])
    mockUpdateReturning.mockResolvedValueOnce([])

    const { withdrawApplication } = await importWithdrawApplication()

    await expect(withdrawApplication("app-1", "student-1")).rejects.toThrow(
      "Application was changed by another action",
    )
  })
})
