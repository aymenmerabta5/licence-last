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
      // Call 1 = user query (with limit)
      // Call 2 = student_profile query (with limit)
      // Call 3 = skills join query (no limit, returns from innerJoin.where)
      if (selectCallIdx <= 2) return { from: mockFrom }
      return { from: mockJoinFrom }
    },
  },
}))

describe("src/server/services/students/get-profile-for-viewer", () => {
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

  test("should include private fields for the owner", async () => {
    const now = new Date()
    const mockUser = {
      id: "user-1",
      name: "Owner",
      email: "owner@example.com",
      role: "student",
      image: null,
      universityId: null,
      createdAt: now,
    }

    const profileRow = {
      bio: "Hello",
      phone: "0555",
      wilayaCode: 25,
      githubUrl: "https://github.com/x",
      portfolioUrl: null,
      studentNumber: "SN-1",
      department: "CS",
      level: "L3",
      address: "Addr",
    }

    const skills = [{ id: "s1", name: "React", slug: "react", category: "frontend" }]

    mockSelectResults.push([mockUser], [profileRow])
    mockJoinWhere.mockResolvedValue(skills)

    const { getStudentProfileForViewer } = await import("./get-profile-for-viewer")
    const result = await getStudentProfileForViewer({
      viewer: { id: "user-1", role: "student" },
      targetUserId: "user-1",
    })

    expect(result?.user.email).toBe("owner@example.com")
    expect(result?.profile?.phone).toBe("0555")
    expect(result?.profile?.studentNumber).toBe("SN-1")
    expect(result?.profile?.address).toBe("Addr")
    expect(result?.skills).toEqual(skills)
  })

  test("should hide private fields for a non-owner", async () => {
    const now = new Date()
    const mockUser = {
      id: "user-1",
      name: "Target",
      email: "target@example.com",
      role: "student",
      image: null,
      universityId: null,
      createdAt: now,
    }

    const profileRow = {
      bio: "Hello",
      phone: "0555",
      wilayaCode: 25,
      githubUrl: "https://github.com/x",
      portfolioUrl: null,
      studentNumber: "SN-1",
      department: "CS",
      level: "L3",
      address: "Addr",
    }

    mockSelectResults.push([mockUser], [profileRow])
    mockJoinWhere.mockResolvedValue([])

    const { getStudentProfileForViewer } = await import("./get-profile-for-viewer")
    const result = await getStudentProfileForViewer({
      viewer: { id: "viewer-2", role: "company_admin" },
      targetUserId: "user-1",
    })

    expect(result?.user.email).toBeNull()
    expect(result?.profile?.phone).toBeNull()
    expect(result?.profile?.studentNumber).toBeNull()
    expect(result?.profile?.address).toBeNull()
    expect(result?.profile?.bio).toBe("Hello")
    expect(result?.profile?.wilayaCode).toBe(25)
  })

  test("should return a base user with null profile when student_profile row does not exist", async () => {
    const now = new Date()
    const mockUser = {
      id: "user-1",
      name: "Target",
      email: "target@example.com",
      role: "company_admin",
      image: null,
      universityId: null,
      createdAt: now,
    }

    mockSelectResults.push([mockUser], []) // no profile row

    const { getStudentProfileForViewer } = await import("./get-profile-for-viewer")
    const result = await getStudentProfileForViewer({
      viewer: { id: "viewer-2", role: "student" },
      targetUserId: "user-1",
    })

    expect(result?.user.email).toBeNull()
    expect(result?.profile).toBeNull()
    expect(result?.skills).toEqual([])
  })
})

