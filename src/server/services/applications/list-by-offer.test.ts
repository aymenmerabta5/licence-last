import { describe, test, expect, mock, beforeEach } from "bun:test"
import { ApplicationServiceError } from "./errors"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

// Call 1: offer query (limit)
const mockLimit1 = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockWhere1 = mock(() => ({ limit: mockLimit1 }))
const mockFrom1 = mock(() => ({ where: mockWhere1 }))

// Call 2: offer skills (where => Promise)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere2 = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFrom2 = mock(() => ({ where: mockWhere2 }))

// Call 3: applications rows (where -> orderBy -> limit)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit3 = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockOrderBy3 = mock(() => ({ limit: mockLimit3 }))
const mockWhere3 = mock(() => ({ orderBy: mockOrderBy3 }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLeftJoinU = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLeftJoinP = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInnerJoin3 = mock(() => ({}) as any)
const mockFrom3 = mock(() => ({ innerJoin: mockInnerJoin3 }))

// Call 4: student skills join (innerJoin -> where => Promise)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere4 = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockInnerJoin4 = mock(() => ({ where: mockWhere4 }))
const mockFrom4 = mock(() => ({ innerJoin: mockInnerJoin4 }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      if (selectCallIdx === 1) return { from: mockFrom1 }
      if (selectCallIdx === 2) return { from: mockFrom2 }
      if (selectCallIdx === 3) return { from: mockFrom3 }
      return { from: mockFrom4 }
    },
  },
}))

describe("src/server/services/applications/list-by-offer", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit1.mockClear()
    mockWhere1.mockClear()
    mockFrom1.mockClear()
    mockWhere2.mockClear()
    mockFrom2.mockClear()

    mockLimit3.mockClear()
    mockOrderBy3.mockClear()
    mockWhere3.mockClear()
    mockInnerJoin3.mockClear()
    mockLeftJoinU.mockClear()
    mockLeftJoinP.mockClear()
    mockFrom3.mockClear()

    mockWhere4.mockClear()
    mockInnerJoin4.mockClear()
    mockFrom4.mockClear()

    mockFrom1.mockReturnValue({ where: mockWhere1 })
    mockWhere1.mockReturnValue({ limit: mockLimit1 })

    mockFrom2.mockReturnValue({ where: mockWhere2 })

    mockFrom3.mockReturnValue({ innerJoin: mockInnerJoin3 })
    mockInnerJoin3.mockReturnValue({ leftJoin: mockLeftJoinP })
    mockLeftJoinP.mockReturnValue({ leftJoin: mockLeftJoinU })
    mockLeftJoinU.mockReturnValue({ where: mockWhere3 })
    mockWhere3.mockReturnValue({ orderBy: mockOrderBy3 })
    mockOrderBy3.mockReturnValue({ limit: mockLimit3 })

    mockFrom4.mockReturnValue({ innerJoin: mockInnerJoin4 })
    mockInnerJoin4.mockReturnValue({ where: mockWhere4 })
  })

  test("should compute skillMatchPercentage", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z")

    mockSelectResults.push([{ id: "offer-1", companyId: "company-1" }])
    mockSelectResults.push([{ skillTagId: "s1" }, { skillTagId: "s2" }])
    mockSelectResults.push([
      {
        id: "app-1",
        status: "applied",
        coverLetter: null,
        createdAt,
        companyActionAt: null,
        companyNote: null,
        studentId: "stu-1",
        studentName: "Student",
        studentImage: null,
        studentEmail: "s@example.com",
        universityId: null,
        universityName: null,
        universityAbbreviation: null,
        profileBio: "Bio",
        profilePhone: null,
        profileGithubUrl: "https://github.com/x",
        profilePortfolioUrl: null,
        profileLevel: "L3",
        profileDepartment: "CS",
      },
    ])
    mockSelectResults.push([
      {
        userId: "stu-1",
        skillId: "s1",
        skillName: "React",
        skillSlug: "react",
        skillCategory: "frontend",
      },
    ])

    const { listApplicationsByOffer } = await import("./list-by-offer")
    const result = await listApplicationsByOffer("offer-1", "company-1")

    expect(result.applications).toHaveLength(1)
    expect(result.applications[0]?.skillMatchPercentage).toBe(50)
  })

  test("should return profile when bio is null but other profile fields exist", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z")

    mockSelectResults.push([{ id: "offer-1", companyId: "company-1" }])
    mockSelectResults.push([])
    mockSelectResults.push([
      {
        id: "app-1",
        status: "applied",
        pipelineStage: "applied",
        coverLetter: null,
        createdAt,
        companyActionAt: null,
        companyNote: null,
        studentId: "stu-1",
        studentName: "Student",
        studentImage: null,
        studentEmail: "s@example.com",
        universityId: null,
        universityName: null,
        universityAbbreviation: null,
        profileBio: null,
        profilePhone: "0550123456",
        profileGithubUrl: null,
        profilePortfolioUrl: null,
        profileLevel: null,
        profileDepartment: null,
      },
    ])
    mockSelectResults.push([])

    const { listApplicationsByOffer } = await import("./list-by-offer")
    const result = await listApplicationsByOffer("offer-1", "company-1")

    expect(result.applications).toHaveLength(1)
    expect(result.applications[0]?.profile).not.toBeNull()
    expect(result.applications[0]?.profile?.phone).toBe("0550123456")
  })

  test("should throw typed not found when offer does not exist", async () => {
    mockSelectResults.push([])

    const { listApplicationsByOffer } = await import("./list-by-offer")
    let thrown: unknown
    try {
      await listApplicationsByOffer("missing-offer", "company-1")
    } catch (error) {
      thrown = error
    }

    expect(thrown).toBeInstanceOf(ApplicationServiceError)
    expect(thrown).toMatchObject({ code: "OFFER_NOT_FOUND" })
  })

  test("should throw typed forbidden when offer belongs to another company", async () => {
    mockSelectResults.push([{ id: "offer-1", companyId: "company-2" }])

    const { listApplicationsByOffer } = await import("./list-by-offer")

    await expect(listApplicationsByOffer("offer-1", "company-1")).rejects.toMatchObject({
      code: "OFFER_FORBIDDEN",
    })
  })
})
