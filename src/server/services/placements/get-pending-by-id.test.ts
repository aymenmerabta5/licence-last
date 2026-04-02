import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit1 = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockWhere1 = mock(() => ({ limit: mockLimit1 }))
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere2 = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockInnerJoin2 = mock(() => ({ where: mockWhere2 }))
const mockFrom2 = mock(() => ({ innerJoin: mockInnerJoin2 }))

function applyServiceMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => {
        selectCallIdx += 1
        if (selectCallIdx === 1) return { from: mockFrom1 }
        return { from: mockFrom2 }
      },
    },
  }))
}

let importCounter = 0
async function importGetPendingApplicationById() {
  importCounter += 1
  return import(
    `@/server/services/placements/get-pending-by-id?test=${importCounter}`
  )
}

describe("src/server/services/placements/get-pending-by-id", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    applyServiceMocks()

    selectCallIdx = 0
    mockSelectResults.length = 0

    mockFrom1.mockClear()
    mockInnerJoinOffer.mockClear()
    mockInnerJoinCompany.mockClear()
    mockInnerJoinUser.mockClear()
    mockLeftJoinProfile.mockClear()
    mockLeftJoinUniversity.mockClear()
    mockWhere1.mockClear()
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
    mockWhere1.mockReturnValue({ limit: mockLimit1 })

    mockFrom2.mockReturnValue({ innerJoin: mockInnerJoin2 })
    mockInnerJoin2.mockReturnValue({ where: mockWhere2 })
  })

  test("should return a scoped pending application with skills", async () => {
    const companyActionAt = new Date("2026-01-01T10:00:00.000Z")
    const createdAt = new Date("2026-01-01T09:00:00.000Z")

    mockSelectResults.push([
      {
        id: "app-1",
        createdAt,
        companyActionAt,
        coverLetter: "Editorial cover letter",
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
        profileDepartment: "Computer Science",
        profileLevel: "M2",
        profileAddress: null,
        offerId: "offer-1",
        offerTitle: "Offer 1",
        offerInternshipType: "pfe",
        offerWorkMode: "remote",
        offerDurationWeeks: 8,
        offerWilayaCode: 16,
        offerApplicationDeadlineAt: null,
        offerExpectedStartDate: null,
        offerExpectedEndDate: null,
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
    ])

    const { getPendingApplicationById } = await importGetPendingApplicationById()
    const result = await getPendingApplicationById("app-1", {
      role: "university_admin",
      universityId: "u-1",
    })

    expect(result?.id).toBe("app-1")
    expect(result?.student.name).toBe("Student 1")
    expect(result?.skills).toEqual([
      {
        id: "skill-1",
        name: "React",
        slug: "react",
        category: "frontend",
      },
    ])
  })

  test("should return null without querying when dept head has no department scope", async () => {
    const { getPendingApplicationById } = await importGetPendingApplicationById()
    const result = await getPendingApplicationById("app-1", {
      role: "department_head",
      universityId: "u-1",
      departmentId: null,
    })

    expect(result).toBeNull()
    expect(selectCallIdx).toBe(0)
  })
})
