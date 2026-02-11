import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})

const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))

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
      return { from: mockFrom }
    },
    update: mockUpdate,
    insert: mockInsert,
  },
}))

describe("src/server/services/applications/withdraw", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockWhere.mockClear()
    mockFrom.mockClear()

    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()

    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should throw when application is not found", async () => {
    mockSelectResults.push([])
    const { withdrawApplication } = await import("./withdraw")
    await expect(
      withdrawApplication("app-1", "student-1"),
    ).rejects.toThrow("Application not found")
  })

  test("should throw when application is not in applied status", async () => {
    mockSelectResults.push([
      { id: "app-1", studentUserId: "student-1", status: "company_accepted" },
    ])
    const { withdrawApplication } = await import("./withdraw")
    await expect(
      withdrawApplication("app-1", "student-1"),
    ).rejects.toThrow("Only pending applications can be withdrawn")
  })

  test("should update status to withdrawn", async () => {
    mockSelectResults.push([
      { id: "app-1", studentUserId: "student-1", status: "applied" },
    ])
    const { withdrawApplication } = await import("./withdraw")
    const result = await withdrawApplication("app-1", "student-1")
    expect(result.newStatus).toBe("withdrawn")
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
