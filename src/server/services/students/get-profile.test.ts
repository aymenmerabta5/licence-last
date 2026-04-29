import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))

const mockJoinWhere = mock<() => Promise<any[]>>(() => Promise.resolve([]))
const mockInnerJoin = mock(() => ({ where: mockJoinWhere }))
const mockJoinFrom = mock(() => ({ innerJoin: mockInnerJoin }))

const mockLanguagesWhere = mock<() => Promise<any[]>>(() => Promise.resolve([]))
const mockLanguagesFrom = mock(() => ({ where: mockLanguagesWhere }))

function applyGetStudentProfileMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => {
        selectCallIdx++
        // Calls 1 & 2 = profile & user queries (with limit)
        // Call 3 = skills join query (no limit, returns from innerJoin.where)
        // Call 4 = languages query (no limit, returns from where)
        if (selectCallIdx <= 2) {
          return { from: mockFrom }
        }
        if (selectCallIdx === 3) {
          return { from: mockJoinFrom }
        }
        return { from: mockLanguagesFrom }
      },
    },
  }))
}

let getStudentProfileImportCounter = 0
async function importGetStudentProfile() {
  getStudentProfileImportCounter += 1
  return import(
    `@/server/services/students/get-profile?test=${getStudentProfileImportCounter}`
  )
}

describe("src/server/services/students/get-profile", () => {
  beforeEach(() => {
    applyGetStudentProfileMocks()

    selectCallIdx = 0
    mockSelectResults.length = 0
    mockLimit.mockClear()
    mockWhere.mockClear()
    mockFrom.mockClear()
    mockJoinWhere.mockClear()
    mockInnerJoin.mockClear()
    mockJoinFrom.mockClear()
    mockLanguagesWhere.mockClear()
    mockLanguagesFrom.mockClear()

    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockJoinFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockJoinWhere })
    mockLanguagesFrom.mockReturnValue({ where: mockLanguagesWhere })
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
    mockLanguagesWhere.mockResolvedValue([])

    const { getStudentProfile } = await importGetStudentProfile()
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

    const { getStudentProfile } = await importGetStudentProfile()
    const result = await getStudentProfile("user-nonexistent")

    expect(result).toBeNull()
  })
})
