import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockGenerateText = mock(async () => ({
  output: {
    description: "Improved professional description.",
  },
}))

const mockOutputObject = mock((opts: { schema: unknown }) => opts.schema)

function applyMocks() {
  mock.module("ai", () => ({
    generateText: mockGenerateText,
    Output: { object: mockOutputObject },
  }))

  mock.module("@/server/ai/model", () => ({
    getAIModel: mock(() => "mock-model"),
  }))
}

describe("src/server/services/offers/improve-description", () => {
  beforeEach(() => {
    applyMocks()

    mockGenerateText.mockClear()
    mockOutputObject.mockClear()
  })

  test("should return improved description from AI", async () => {
    const { improveOfferDescription } = await import(
      `@/server/services/offers/improve-description?fresh=${Date.now()}`
    )

    const result = await improveOfferDescription({
      title: "Frontend Intern",
      description: "We need someone who knows React.",
      internshipType: "pfe",
      workMode: "remote",
      durationWeeks: 12,
    })

    expect(result.description).toBe("Improved professional description.")
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  test("should include all context fields in prompt", async () => {
    const { improveOfferDescription } = await import(
      `@/server/services/offers/improve-description?fresh=${Date.now()}`
    )

    await improveOfferDescription({
      title: "Backend Intern",
      description: "Node.js work",
      internshipType: "summer",
      workMode: "on_site",
      wilayaCode: 16,
      durationWeeks: 8,
      maxPositions: 3,
      applicationDeadlineAt: "2025-06-01",
      expectedStartDate: "2025-07-01",
      expectedEndDate: "2025-09-01",
    })

    const callArgs = mockGenerateText.mock.calls[0] as unknown as [
      { prompt: string },
    ]
    expect(callArgs[0].prompt).toContain("Backend Intern")
    expect(callArgs[0].prompt).toContain("Node.js work")
    expect(callArgs[0].prompt).toContain("summer")
    expect(callArgs[0].prompt).toContain("on_site")
    expect(callArgs[0].prompt).toContain("8 weeks")
    expect(callArgs[0].prompt).toContain("2025-06-01")
    expect(callArgs[0].prompt).toContain("2025-07-01")
    expect(callArgs[0].prompt).toContain("2025-09-01")
  })

  test("should handle missing optional fields", async () => {
    const { improveOfferDescription } = await import(
      `@/server/services/offers/improve-description?fresh=${Date.now()}`
    )

    const result = await improveOfferDescription({
      description: "Simple description",
    })

    expect(result.description).toBe("Improved professional description.")
  })
})
