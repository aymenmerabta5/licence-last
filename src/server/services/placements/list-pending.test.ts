import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

// Call 1: pending applications query (joins -> where -> orderBy -> limit)
const mockLimit1 = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockOrderBy1 = mock(() => ({ limit: mockLimit1 }))
const mockWhere1 = mock(() => ({ orderBy: mockOrderBy1 }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLeftJoinUniversity = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLeftJoinProfile = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInnerJoinUser = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInnerJoinCompany = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInnerJoinOffer = mock(() => ({}) as any)
const mockFrom1 = mock(() => ({ innerJoin: mockInnerJoinOffer }))

// Call 2: batched student skills query (innerJoin -> where => Promise)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere2 = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockInnerJoin2 = mock(() => ({ where: mockWhere2 }))
const mockFrom2 = mock(() => ({ innerJoin: mockInnerJoin2 }))

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx += 1
      if (selectCallIdx === 1) return { from: mockFrom1 }
      return { from: mockFrom2 }
    },
  },
}))

describe("src/server/services/placements/list-pending", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockFrom1.mockClear()
    mockInnerJoinOffer.mockClear()
    mockInnerJoinCompany.mockClear()
    mockInnerJoinUser.mockClear()
    mockLeftJoinProfile.mockClear()
    mockLeftJoinUniversity.mockClear()
    mockWhere1.mockClear()
    mockOrderBy1.mockClear()
    mockLimit1.mockClear()

    mockFrom2.mockClear()
    mockInnerJoin2.mockClear()
    mockWhere2.mockClear()

    mockFrom1.mockReturnValue({ innerJoin: mockInnerJoinOffer })
    mockInnerJoinOffer.mockReturnValue({ innerJoin: mockInnerJoinCompany })
    mockInnerJoinCompany.mockReturnValue({ innerJoin: mockInnerJoinUser })
    mockInnerJoinUser.mockReturnValue({ leftJoin: mockLeftJoinProfile })
    mockLeftJoinProfile.mockReturnValue({ leftJoin: mockLeftJoinUniversity })
    mockLeftJoinUniversity.mockReturnValue({ where: mockWhere1 })
    mockWhere1.mockReturnValue({ orderBy: mockOrderBy1 })
    mockOrderBy1.mockReturnValue({ limit: mockLimit1 })

    mockFrom2.mockReturnValue({ innerJoin: mockInnerJoin2 })
    mockInnerJoin2.mockReturnValue({ where: mockWhere2 })
  })

  test("should batch skills query once and keep partial profile data", async () => {
    const companyActionAt = new Date("2026-01-01T10:00:00.000Z")
    const createdAt = new Date("2026-01-01T09:00:00.000Z")

    mockSelectResults.push([
      {
        id: "app-1",
        createdAt,
        companyActionAt,
        coverLetter: null,
        studentId: "stu-1",
        studentName: "Student 1",
        studentEmail: "s1@example.com",
        studentImage: null,
        universityId: "u-1",
        universityName: "Uni 1",
        universityAbbreviation: "U1",
        universityDepartmentName: "CS",
        universityAddress: null,
        universityCity: "Algiers",
        universityPhone: null,
        profileBio: null,
        profilePhone: "0550123456",
        profileStudentNumber: null,
        profileDepartment: null,
        profileLevel: null,
        profileAddress: null,
        offerId: "offer-1",
        offerTitle: "Offer 1",
        offerInternshipType: "pfe",
        offerWorkMode: "remote",
        offerDurationWeeks: 8,
        offerWilayaCode: 16,
        companyId: "company-1",
        companyName: "Acme",
        companyAddress: null,
        companyPhone: null,
        companyRepresentativeName: null,
        companyContactEmail: null,
      },
      {
        id: "app-2",
        createdAt,
        companyActionAt,
        coverLetter: null,
        studentId: "stu-2",
        studentName: "Student 2",
        studentEmail: "s2@example.com",
        studentImage: null,
        universityId: null,
        universityName: null,
        universityAbbreviation: null,
        universityDepartmentName: null,
        universityAddress: null,
        universityCity: null,
        universityPhone: null,
        profileBio: null,
        profilePhone: null,
        profileStudentNumber: null,
        profileDepartment: null,
        profileLevel: null,
        profileAddress: null,
        offerId: "offer-2",
        offerTitle: "Offer 2",
        offerInternshipType: "summer",
        offerWorkMode: "on_site",
        offerDurationWeeks: 6,
        offerWilayaCode: 31,
        companyId: "company-1",
        companyName: "Acme",
        companyAddress: null,
        companyPhone: null,
        companyRepresentativeName: null,
        companyContactEmail: null,
      },
    ])
    mockSelectResults.push([
      {
        userId: "stu-1",
        skillId: "skill-1",
        skillName: "React",
        skillSlug: "react",
        skillCategory: "frontend",
      },
      {
        userId: "stu-2",
        skillId: "skill-2",
        skillName: "Node.js",
        skillSlug: "node-js",
        skillCategory: "backend",
      },
    ])

    const { listPendingApplications } = await import("@/server/services/placements/list-pending")
    const result = await listPendingApplications(
      {},
      { role: "super_admin", universityId: null },
    )

    expect(result.applications).toHaveLength(2)
    expect(mockWhere2).toHaveBeenCalledTimes(1)
    expect(result.applications[0]?.profile).not.toBeNull()
    expect(result.applications[0]?.profile?.phone).toBe("0550123456")
    expect(result.applications[1]?.profile).toBeNull()
  })

  test("should return empty results when admin has no university scope", async () => {
    const { listPendingApplications } = await import("@/server/services/placements/list-pending")
    const result = await listPendingApplications(
      {},
      { role: "university_admin", universityId: null },
    )

    expect(result.applications).toEqual([])
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeUndefined()
    expect(selectCallIdx).toBe(0)
  })
})
