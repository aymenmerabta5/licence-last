import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJoin2 = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJoin1 = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock(() => ({}) as any)

mock.module("@/server/db", () => ({
  db: {
    select: () => ({ from: mockFrom }),
  },
}))

describe("src/server/services/applications/list-by-student", () => {
  beforeEach(() => {
    mockLimit.mockClear()
    mockOrderBy.mockClear()
    mockWhere.mockClear()
    mockJoin1.mockClear()
    mockJoin2.mockClear()
    mockFrom.mockClear()

    mockFrom.mockReturnValue({ innerJoin: mockJoin1 })
    mockJoin1.mockReturnValue({ innerJoin: mockJoin2 })
    mockJoin2.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
  })

  test.skip("should paginate and return nextCursor when hasMore", async () => {
    const createdAt1 = new Date("2025-01-02T00:00:00.000Z")
    const createdAt2 = new Date("2025-01-01T00:00:00.000Z")

    mockLimit.mockResolvedValue([
      {
        id: "app-1",
        status: "applied",
        coverLetter: null,
        createdAt: createdAt1,
        offerId: "offer-1",
        offerTitle: "Offer 1",
        offerInternshipType: "pfe",
        offerWorkMode: "remote",
        offerWilayaCode: 16,
        companyName: "Acme",
        companySlug: "acme",
        companyLogoUrl: null,
      },
      {
        id: "app-2",
        status: "applied",
        coverLetter: null,
        createdAt: createdAt2,
        offerId: "offer-2",
        offerTitle: "Offer 2",
        offerInternshipType: "summer",
        offerWorkMode: "hybrid",
        offerWilayaCode: 25,
        companyName: "Beta",
        companySlug: "beta",
        companyLogoUrl: null,
      },
    ])

    const { listApplicationsByStudent } = await import("@/server/services/applications/list-by-student")
    const result = await listApplicationsByStudent("student-1", { limit: 1 })

    expect(result.applications).toHaveLength(1)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toEqual({
      createdAt: createdAt1.toISOString(),
      id: "app-1",
    })
  })
})
