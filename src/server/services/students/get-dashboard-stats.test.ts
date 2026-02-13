import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockResults: any[][] = []
let selectCallIdx = 0

const mockWhere = mock(() => {
  const result = mockResults[selectCallIdx - 1] ?? [{ count: 0 }]
  return Promise.resolve(result)
})
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => {
  selectCallIdx++
  return { from: mockFrom }
})

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/students/get-dashboard-stats", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockResults.length = 0
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()

    mockSelect.mockImplementation(() => {
      selectCallIdx++
      return { from: mockFrom }
    })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockImplementation(() => {
      const result = mockResults[selectCallIdx - 1] ?? [{ count: 0 }]
      return Promise.resolve(result)
    })
  })

  test("should return all zero stats for a new student", async () => {
    // 4 queries: total, pending, accepted, skills
    mockResults.push([{ count: 0 }])
    mockResults.push([{ count: 0 }])
    mockResults.push([{ count: 0 }])
    mockResults.push([{ count: 0 }])

    const { getStudentDashboardStats } = await import("./get-dashboard-stats")
    const result = await getStudentDashboardStats("student-1")

    expect(result).toEqual({
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      skillsCount: 0,
    })
  })

  test("should return correct counts for active student", async () => {
    mockResults.push([{ count: 10 }]) // total
    mockResults.push([{ count: 3 }]) // pending
    mockResults.push([{ count: 2 }]) // accepted
    mockResults.push([{ count: 5 }]) // skills

    const { getStudentDashboardStats } = await import("./get-dashboard-stats")
    const result = await getStudentDashboardStats("student-2")

    expect(result).toEqual({
      totalApplications: 10,
      pendingApplications: 3,
      acceptedApplications: 2,
      skillsCount: 5,
    })
  })
})
