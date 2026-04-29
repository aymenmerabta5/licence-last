import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelectResults: any[][] = []
let selectCallIdx = 0

// Calls with where => Promise

const mockWhere = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromWhere = mock(() => ({ where: mockWhere }))

// Call with innerJoin => Promise

const mockInnerJoin = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromInnerJoin = mock(() => ({ innerJoin: mockInnerJoin }))

// Call with groupBy => Promise

const mockGroupBy = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromGroupBy = mock(() => ({ groupBy: mockGroupBy }))

function applyGetAdminStatsMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => {
        selectCallIdx++
        if (selectCallIdx === 2) return { from: mockFromInnerJoin }
        if (selectCallIdx === 5) return { from: mockFromGroupBy }
        return { from: mockFromWhere }
      },
    },
  }))
}

let getAdminStatsImportCounter = 0
async function importGetAdminStats() {
  getAdminStatsImportCounter += 1
  return import(
    `@/server/services/stats/get-admin-stats?test=${getAdminStatsImportCounter}`
  )
}

describe("src/server/services/stats/get-admin-stats", () => {
  beforeEach(() => {
    applyGetAdminStatsMocks()

    selectCallIdx = 0
    mockSelectResults.length = 0
    mockWhere.mockClear()
    mockFromWhere.mockClear()
    mockInnerJoin.mockClear()
    mockFromInnerJoin.mockClear()
    mockGroupBy.mockClear()
    mockFromGroupBy.mockClear()

    mockFromWhere.mockReturnValue({ where: mockWhere })
    mockFromInnerJoin.mockReturnValue({ innerJoin: mockInnerJoin })
    mockFromGroupBy.mockReturnValue({ groupBy: mockGroupBy })
  })

  test("should compute placement rate and breakdown", async () => {
    mockSelectResults.push([{ value: 10 }]) // total students
    mockSelectResults.push([{ value: 4 }]) // placed distinct students
    mockSelectResults.push([{ value: 3 }]) // approved companies
    mockSelectResults.push([{ value: 7 }]) // published offers
    mockSelectResults.push([
      { status: "applied", value: 5 },
      { status: "company_accepted", value: 2 },
      { status: "admin_validated", value: 1 },
    ])

    const { getAdminStats } = await importGetAdminStats()
    const stats = await getAdminStats()

    expect(stats.totalStudents).toBe(10)
    expect(stats.placedStudents).toBe(4)
    expect(stats.unplacedStudents).toBe(6)
    expect(stats.placementRate).toBe(40)
    expect(stats.totalCompaniesApproved).toBe(3)
    expect(stats.totalOffersPublished).toBe(7)
    expect(stats.totalApplications).toBe(8)
    expect(stats.applicationsByStatus.applied).toBe(5)
  })
})
