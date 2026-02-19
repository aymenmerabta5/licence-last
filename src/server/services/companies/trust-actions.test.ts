import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockPlacementRows: any[] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockUpsertRows: any[] = []

const mockSelectLimit = mock(() => Promise.resolve(mockPlacementRows))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectJoinOffer = mock(() => ({ where: mockSelectWhere }))
const mockSelectJoinApplication = mock(() => ({
  innerJoin: mockSelectJoinOffer,
}))
const mockSelectFrom = mock(() => ({ innerJoin: mockSelectJoinApplication }))

const mockInsertReturning = mock(() => Promise.resolve(mockUpsertRows))
const mockInsertConflict = mock(() => ({ returning: mockInsertReturning }))
const mockInsertValues = mock(() => ({
  onConflictDoUpdate: mockInsertConflict,
}))
const mockInsert = mock(() => ({ values: mockInsertValues }))

mock.module("@/server/db", () => ({
  db: {
    select: () => ({ from: mockSelectFrom }),
    insert: mockInsert,
  },
}))

describe("src/server/services/companies/trust-actions submitCompanyQualityFeedback", () => {
  beforeEach(() => {
    mockPlacementRows = []
    mockUpsertRows = []

    mockSelectLimit.mockClear()
    mockSelectWhere.mockClear()
    mockSelectJoinOffer.mockClear()
    mockSelectJoinApplication.mockClear()
    mockSelectFrom.mockClear()

    mockInsertReturning.mockClear()
    mockInsertConflict.mockClear()
    mockInsertValues.mockClear()
    mockInsert.mockClear()
  })

  test("should return persisted feedback id from upsert result", async () => {
    mockPlacementRows = [
      {
        placementId: "placement-1",
        applicationId: "application-1",
        studentUserId: "student-1",
        applicationStatus: "admin_validated",
        companyId: "company-1",
      },
    ]
    mockUpsertRows = [{ id: "feedback-existing-id" }]

    const { submitCompanyQualityFeedback } = await import(
      "@/server/services/companies/trust-actions"
    )
    const result = await submitCompanyQualityFeedback({
      studentUserId: "student-1",
      placementId: "placement-1",
      rating: 4,
      wouldRecommend: true,
      comment: "Great mentorship",
    })

    expect(result).toEqual({
      feedbackId: "feedback-existing-id",
      companyId: "company-1",
    })
  })
})
