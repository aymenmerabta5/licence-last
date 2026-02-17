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
const mockJoinWhere = mock<() => Promise<any[]>>(() => Promise.resolve([]))
const mockInnerJoin = mock(() => ({ where: mockJoinWhere }))
const mockJoinFrom = mock(() => ({ innerJoin: mockInnerJoin }))

mock.module("@/server/db", () => ({
  db: {
      select: () => {
      selectCallIdx++
      // Calls 1 & 2 = profile & user queries (with limit)
      // Call 3 = skills join query (no limit, returns from innerJoin.where)
      if (selectCallIdx <= 2) {
        return { from: mockFrom }
      }
      return { from: mockJoinFrom }
    },
  },
}))

describe("src/server/services/students/get-profile", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0
    mockLimit.mockClear()
    mockWhere.mockClear()
    mockFrom.mockClear()
    mockJoinWhere.mockClear()
    mockInnerJoin.mockClear()
    mockJoinFrom.mockClear()

    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockJoinFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockJoinWhere })
  })

  test("should return profile with skills when exists", async () => {
    const mockProfile = {
      userId: "user-1",
      bio: "Hello",
      phone: "0555",
      githubUrl: null,
      portfolioUrl: null,
      studentNumber: null,
      department: "CS",
      departmentId: null,
      level: "L3",
      wilayaCode: 25,
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const mockUser = {
      name: "John",
      email: "john@example.com",
      universityId: null,
    }
    const mockSkills = [
      { id: "s1", name: "React", slug: "react", category: "frontend" },
    ]

    // Push results in order: profile query, user query
    mockSelectResults.push([mockProfile], [mockUser])
    mockLimit.mockImplementation(() => {
      const results = mockSelectResults[selectCallIdx - 1] ?? []
      return Promise.resolve(results)
    })
    mockJoinWhere.mockResolvedValue(mockSkills)

    const { getStudentProfile } = await import("@/server/services/students/get-profile")
    const result = await getStudentProfile("user-1")

    expect(result).not.toBeNull()
    expect(result?.profile).toEqual(mockProfile)
    expect(result?.user).toEqual(mockUser)
    expect(result?.skills).toEqual(mockSkills)
  })

  test("should return null when no profile exists", async () => {
    // First select (profile) returns empty
    mockSelectResults.push([])
    mockLimit.mockImplementation(() => {
      const results = mockSelectResults[selectCallIdx - 1] ?? []
      return Promise.resolve(results)
    })

    const { getStudentProfile } = await import("@/server/services/students/get-profile")
    const result = await getStudentProfile("user-nonexistent")

    expect(result).toBeNull()
  })
})
