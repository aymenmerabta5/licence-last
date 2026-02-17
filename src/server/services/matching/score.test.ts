import { describe, expect, mock, test, beforeEach } from "bun:test"

// ─── Mock setup ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDbChain: any = {
  select: mock(() => mockDbChain),
  from: mock(() => mockDbChain),
  where: mock(() => mockDbChain),
  limit: mock(() => mockDbChain),
  innerJoin: mock(() => mockDbChain),
  then: mock(() => Promise.resolve(undefined)),
  returning: mock(() => Promise.resolve([])),
}

mock.module("@/server/db", () => ({ db: mockDbChain }))

// ─── canAccessMatchScore (pure logic, no DB) ──────────────────────────────

describe("canAccessMatchScore", () => {
  const baseParams = {
    studentUserId: "student-1",
    offerCompanyId: "company-1",
    isOfferVisibleToStudent: true,
    viewerCompanyId: "company-1",
  }

  test("should allow super_admin regardless of params", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore({ id: "admin-1", role: "super_admin" }, baseParams),
    ).toBe(true)
  })

  test("should allow university_admin regardless of params", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore({ id: "uadmin-1", role: "university_admin" }, baseParams),
    ).toBe(true)
  })

  test("should allow student viewing own score for visible offer", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore({ id: "student-1", role: "student" }, baseParams),
    ).toBe(true)
  })

  test("should deny student viewing own score for non-visible offer", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore(
        { id: "student-1", role: "student" },
        { ...baseParams, isOfferVisibleToStudent: false },
      ),
    ).toBe(false)
  })

  test("should deny student viewing another student's score", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore({ id: "student-2", role: "student" }, baseParams),
    ).toBe(false)
  })

  test("should allow company_admin for their own company's offer", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore({ id: "cadmin-1", role: "company_admin" }, baseParams),
    ).toBe(true)
  })

  test("should deny company_admin for another company's offer", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore(
        { id: "cadmin-1", role: "company_admin" },
        { ...baseParams, viewerCompanyId: "company-other" },
      ),
    ).toBe(false)
  })

  test("should deny company_admin with undefined viewerCompanyId", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore(
        { id: "cadmin-1", role: "company_admin" },
        { ...baseParams, viewerCompanyId: undefined },
      ),
    ).toBe(false)
  })

  test("should deny dept_head role", async () => {
    const { canAccessMatchScore } = await import("@/server/services/matching/score")
    expect(
      canAccessMatchScore({ id: "dh-1", role: "dept_head" }, baseParams),
    ).toBe(false)
  })
})

// ─── getOfferAccessContext (simple DB read) ────────────────────────────────

describe("getOfferAccessContext", () => {
  beforeEach(() => {
    for (const fn of Object.values(mockDbChain)) (fn as ReturnType<typeof mock>).mockClear()
    mockDbChain.select.mockReturnValue(mockDbChain)
    mockDbChain.from.mockReturnValue(mockDbChain)
    mockDbChain.where.mockReturnValue(mockDbChain)
    mockDbChain.limit.mockReturnValue(mockDbChain)
  })

  test("should return offer context when found", async () => {
    const offer = { companyId: "company-1", status: "published" as const }
    mockDbChain.limit.mockResolvedValue([offer])

    const { getOfferAccessContext } = await import("@/server/services/matching/score")
    const result = await getOfferAccessContext("offer-1")
    expect(result).toEqual(offer)
  })

  test("should return null when offer not found", async () => {
    mockDbChain.limit.mockResolvedValue([])

    const { getOfferAccessContext } = await import("@/server/services/matching/score")
    const result = await getOfferAccessContext("nonexistent")
    expect(result).toBeNull()
  })
})
