import { describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/companies/trust-index getCompanyTrustIndex", () => {
  test("should throw when company does not exist", async () => {
    const { getCompanyTrustIndex } = await import("./trust-index")

    await expect(getCompanyTrustIndex("missing-company")).rejects.toThrow(
      "Company not found",
    )
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })
})

describe("src/server/services/companies/trust-index computeTrustFactors", () => {
  test("should return excellent tier for perfect scores", async () => {
    const { computeTrustFactors } = await import("./trust-index")

    const result = computeTrustFactors({
      companyId: "company-1",
      totalApplications: 10,
      respondedApplications: 10,
      acceptedApplications: 5,
      validatedApplications: 5,
      feedback: [
        { rating: 5, wouldRecommend: true },
        { rating: 5, wouldRecommend: true },
      ],
      reports: [],
      hasOffers: true,
    })

    expect(result.tier).toBe("excellent")
    expect(result.trustScore).toBeGreaterThanOrEqual(80)
    expect(result.factors.responseRate).toBe(100)
    expect(result.factors.completionRate).toBe(100)
    expect(result.factors.reportPenalty).toBe(0)
    expect(result.alerts).toEqual([])
  })

  test("should return low tier for poor scores", async () => {
    const { computeTrustFactors } = await import("./trust-index")

    const result = computeTrustFactors({
      companyId: "company-2",
      totalApplications: 100,
      respondedApplications: 10,
      acceptedApplications: 5,
      validatedApplications: 0,
      feedback: [
        { rating: 1, wouldRecommend: false },
        { rating: 1, wouldRecommend: false },
      ],
      reports: [
        { severity: "critical", status: "open" },
        { severity: "high", status: "open" },
        { severity: "high", status: "reviewing" },
      ],
      hasOffers: true,
    })

    expect(result.tier).toBe("low")
    expect(result.trustScore).toBeLessThan(45)
    expect(result.alerts).toContain("Multiple unresolved reports are open.")
    expect(result.alerts).toContain("Response rate is below platform expectations.")
  })

  test("should show alert when company has no offers", async () => {
    const { computeTrustFactors } = await import("./trust-index")

    const result = computeTrustFactors({
      companyId: "company-3",
      totalApplications: 0,
      respondedApplications: 0,
      acceptedApplications: 0,
      validatedApplications: 0,
      feedback: [],
      reports: [],
      hasOffers: false,
    })

    expect(result.alerts).toContain("No published pipeline data yet.")
    // Default feedback score is 60, response/completion are 100 each
    // Score = 100*0.3 + 100*0.3 + 60*0.3 - 0 + 10 = 88
    expect(result.tier).toBe("excellent")
  })

  test("should cap report penalty at 100 in factors", async () => {
    const { computeTrustFactors } = await import("./trust-index")

    const result = computeTrustFactors({
      companyId: "company-4",
      totalApplications: 10,
      respondedApplications: 10,
      acceptedApplications: 5,
      validatedApplications: 5,
      feedback: [],
      reports: [
        { severity: "critical", status: "open" },
        { severity: "critical", status: "open" },
        { severity: "critical", status: "open" },
        { severity: "critical", status: "open" },
        { severity: "critical", status: "open" },
      ],
      hasOffers: true,
    })

    expect(result.factors.reportPenalty).toBe(100)
    // But actual penalty in score calc is capped at 40
  })

  test("should not penalize resolved reports", async () => {
    const { computeTrustFactors } = await import("./trust-index")

    const result = computeTrustFactors({
      companyId: "company-5",
      totalApplications: 10,
      respondedApplications: 10,
      acceptedApplications: 5,
      validatedApplications: 5,
      feedback: [{ rating: 5, wouldRecommend: true }],
      reports: [
        { severity: "critical", status: "resolved" },
        { severity: "high", status: "dismissed" },
      ],
      hasOffers: true,
    })

    expect(result.factors.reportPenalty).toBe(0)
  })

  test("should calculate feedback score from ratings and recommendations", async () => {
    const { computeTrustFactors } = await import("./trust-index")

    const result = computeTrustFactors({
      companyId: "company-6",
      totalApplications: 10,
      respondedApplications: 10,
      acceptedApplications: 5,
      validatedApplications: 5,
      feedback: [
        { rating: 3, wouldRecommend: true },
        { rating: 3, wouldRecommend: false },
      ],
      reports: [],
      hasOffers: true,
    })

    // avgRating = 3, recommendRate = 0.5
    // feedbackScore = clamp((3/5)*70 + 0.5*30) = clamp(42 + 15) = 57
    expect(result.factors.feedbackScore).toBe(57)
  })
})
