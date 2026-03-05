import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockLimit = mock(() => Promise.resolve([]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))
let moduleImportCounter = 0

function applyTrustIndexMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

async function loadTrustIndexModule() {
  moduleImportCounter += 1
  return import(`@/server/services/companies/trust-index?test=${moduleImportCounter}`)
}

describe("src/server/services/companies/trust-index getCompanyTrustIndex", () => {
  beforeEach(() => {
    applyTrustIndexMocks()
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockLimit.mockImplementation(() => Promise.resolve([]))
  })

  test("should throw when company does not exist", async () => {
    const { getCompanyTrustIndex } = await loadTrustIndexModule()

    await expect(getCompanyTrustIndex("missing-company")).rejects.toThrow(
      "Company not found",
    )
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })
})

describe("src/server/services/companies/trust-index computeTrustFactors", () => {
  test("should return excellent tier for perfect scores", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

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
    const { computeTrustFactors } = await loadTrustIndexModule()

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
    expect(result.alerts).toContain(
      "Response rate is below platform expectations.",
    )
  })

  test("should show alert when company has no offers", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

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
    const { computeTrustFactors } = await loadTrustIndexModule()

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
    // Score path still caps report penalty contribution at 40.
    expect(result.trustScore).toBe(48)
  })

  test("should not penalize resolved reports", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

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
    const { computeTrustFactors } = await loadTrustIndexModule()

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

  test("should return good tier for healthy but non-perfect performance", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

    const result = computeTrustFactors({
      companyId: "company-7",
      totalApplications: 100,
      respondedApplications: 70,
      acceptedApplications: 50,
      validatedApplications: 30,
      feedback: [{ rating: 4, wouldRecommend: true }],
      reports: [],
      hasOffers: true,
    })

    expect(result.trustScore).toBe(75)
    expect(result.tier).toBe("good")
    expect(result.alerts).toEqual([])
  })

  test("should return watch tier for mediocre outcomes", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

    const result = computeTrustFactors({
      companyId: "company-8",
      totalApplications: 100,
      respondedApplications: 50,
      acceptedApplications: 50,
      validatedApplications: 20,
      feedback: [
        { rating: 3, wouldRecommend: true },
        { rating: 3, wouldRecommend: false },
      ],
      reports: [],
      hasOffers: true,
    })

    expect(result.trustScore).toBe(54)
    expect(result.tier).toBe("watch")
  })

  test("should apply fallback report severity weight for unknown severities", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

    const result = computeTrustFactors({
      companyId: "company-9",
      totalApplications: 10,
      respondedApplications: 10,
      acceptedApplications: 5,
      validatedApplications: 5,
      feedback: [],
      reports: [
        { severity: "mystery", status: "open" },
        { severity: "medium", status: "reviewing" },
      ],
      hasOffers: true,
    })

    expect(result.factors.reportPenalty).toBe(16)
    expect(result.trustScore).toBe(72)
  })

  test("should not flag response-rate alert at exactly 45 percent", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

    const result = computeTrustFactors({
      companyId: "company-10",
      totalApplications: 20,
      respondedApplications: 9,
      acceptedApplications: 0,
      validatedApplications: 0,
      feedback: [],
      reports: [],
      hasOffers: true,
    })

    expect(result.factors.responseRate).toBe(45)
    expect(result.alerts).not.toContain(
      "Response rate is below platform expectations.",
    )
  })

  test("should clamp rates to 100 when counts exceed totals", async () => {
    const { computeTrustFactors } = await loadTrustIndexModule()

    const result = computeTrustFactors({
      companyId: "company-11",
      totalApplications: 10,
      respondedApplications: 20,
      acceptedApplications: 5,
      validatedApplications: 10,
      feedback: [],
      reports: [],
      hasOffers: true,
    })

    expect(result.factors.responseRate).toBe(100)
    expect(result.factors.completionRate).toBe(100)
    expect(result.trustScore).toBe(88)
  })
})


