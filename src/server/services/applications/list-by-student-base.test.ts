import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([] as any[]))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))
const mockInnerJoin = mock(() => ({ where: mockWhere }) as any)
const mockFrom = mock(() => ({ innerJoin: mockInnerJoin }))
const mockSelect = mock(() => ({ from: mockFrom }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

describe("src/server/services/applications/list-by-student-base", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockInnerJoin.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ innerJoin: mockInnerJoin })
    // After second innerJoin, chain leads to where
    mockInnerJoin.mockImplementation(() => ({
      innerJoin: mockInnerJoin,
      where: mockWhere,
    }))
    // Final where call
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
  })

  test("should return applications with pagination info", async () => {
    const applications = [
      {
        id: "app-1",
        status: "applied",
        pipelineStage: "applied",
        coverLetter: "Hello",
        createdAt: new Date("2024-01-01"),
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        offerInternshipType: "pfe",
        offerWorkMode: "remote",
        offerWilayaCode: 16,
        companyName: "Acme",
        companySlug: "acme",
        companyLogoUrl: null,
      },
    ]
    mockLimit.mockResolvedValue(applications)

    const { listApplicationsByStudentUncached } = await import(
      `@/server/services/applications/list-by-student-base?fresh=${Date.now()}`
    )

    const result = await listApplicationsByStudentUncached("student-1", {
      limit: 10,
    })

    expect(result.applications).toEqual(applications)
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeUndefined()
  })

  test("should set hasMore and nextCursor when more results exist", async () => {
    const applications = Array.from({ length: 11 }, (_, i) => ({
      id: `app-${i}`,
      status: "applied",
      pipelineStage: "applied",
      coverLetter: null,
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, "0")}`),
      offerId: `offer-${i}`,
      offerTitle: `Intern ${i}`,
      offerInternshipType: "pfe",
      offerWorkMode: "remote" as const,
      offerWilayaCode: 16,
      companyName: "Acme",
      companySlug: "acme",
      companyLogoUrl: null,
    }))
    mockLimit.mockResolvedValue(applications)

    const { listApplicationsByStudentUncached } = await import(
      `@/server/services/applications/list-by-student-base?fresh=${Date.now()}`
    )

    const result = await listApplicationsByStudentUncached("student-1", {
      limit: 10,
    })

    expect(result.applications).toHaveLength(10)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBeDefined()
    expect(result.nextCursor?.id).toBe("app-9")
  })

  test("should filter by status when provided", async () => {
    mockLimit.mockResolvedValue([])

    const { listApplicationsByStudentUncached } = await import(
      `@/server/services/applications/list-by-student-base?fresh=${Date.now()}`
    )

    await listApplicationsByStudentUncached("student-1", {
      status: "applied",
      limit: 10,
    })

    expect(mockWhere).toHaveBeenCalled()
  })

  test("should filter by pipelineStage when provided", async () => {
    mockLimit.mockResolvedValue([])

    const { listApplicationsByStudentUncached } = await import(
      `@/server/services/applications/list-by-student-base?fresh=${Date.now()}`
    )

    await listApplicationsByStudentUncached("student-1", {
      pipelineStage: "interview",
      limit: 10,
    })

    expect(mockWhere).toHaveBeenCalled()
  })
})
