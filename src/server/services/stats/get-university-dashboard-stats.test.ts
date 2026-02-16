import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromWhere = mock(() => ({ where: mockWhere }))
const mockInnerJoin = mock(() => ({ where: mockWhere }))
const mockFromInnerJoin = mock(() => ({ innerJoin: mockInnerJoin }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      if (selectCallIdx <= 3) return { from: mockFromWhere }
      return { from: mockFromInnerJoin }
    },
  },
}))

describe("src/server/services/stats/get-university-dashboard-stats", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0
    mockWhere.mockClear()
    mockFromWhere.mockClear()
    mockInnerJoin.mockClear()
    mockFromInnerJoin.mockClear()

    mockFromWhere.mockReturnValue({ where: mockWhere })
    mockFromInnerJoin.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockWhere })
  })

  test("should return scoped university dashboard metrics", async () => {
    mockSelectResults.push([{ value: 120 }]) // students
    mockSelectResults.push([{ value: 9 }]) // departments
    mockSelectResults.push([{ value: 7 }]) // dept heads
    mockSelectResults.push([{ value: 342 }]) // total applications
    mockSelectResults.push([{ value: 18 }]) // pending validations
    mockSelectResults.push([{ value: 90 }]) // validated placements

    const { getUniversityDashboardStats } = await import("./get-university-dashboard-stats")
    const stats = await getUniversityDashboardStats("uni-1")

    expect(stats.totalStudents).toBe(120)
    expect(stats.totalDepartments).toBe(9)
    expect(stats.totalDeptHeads).toBe(7)
    expect(stats.totalApplications).toBe(342)
    expect(stats.pendingValidations).toBe(18)
    expect(stats.validatedPlacements).toBe(90)
    expect(stats.placementRate).toBe(75)
  })

  test("should return zeros when no data exists", async () => {
    mockSelectResults.push([])
    mockSelectResults.push([])
    mockSelectResults.push([])
    mockSelectResults.push([])
    mockSelectResults.push([])
    mockSelectResults.push([])

    const { getUniversityDashboardStats } = await import("./get-university-dashboard-stats")
    const stats = await getUniversityDashboardStats("uni-empty")

    expect(stats).toEqual({
      totalStudents: 0,
      totalDepartments: 0,
      totalDeptHeads: 0,
      totalApplications: 0,
      pendingValidations: 0,
      validatedPlacements: 0,
      placementRate: 0,
    })
  })
})
