import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockGenerateText = mock(async () => ({
  output: {
    summaryBullets: [
      "Student: John Doe",
      "Company: Acme",
      "Offer: Frontend Intern",
    ],
    checklist: ["Verify student documents"],
    potentialInconsistencies: [],
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

describe("src/server/services/placements/generate-validation-summary", () => {
  beforeEach(() => {
    applyMocks()

    mockGenerateText.mockClear()
    mockOutputObject.mockClear()
  })

  test("should return validation summary from AI", async () => {
    const { generateValidationSummary } = await import(
      `@/server/services/placements/generate-validation-summary?fresh=${Date.now()}`
    )

    const result = await generateValidationSummary({
      application: {
        studentName: "John Doe",
        companyName: "Acme",
        offerTitle: "Frontend Intern",
      },
    })

    expect(result.summaryBullets).toEqual([
      "Student: John Doe",
      "Company: Acme",
      "Offer: Frontend Intern",
    ])
    expect(result.checklist).toEqual(["Verify student documents"])
    expect(result.potentialInconsistencies).toEqual([])
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  test("should include application data in the prompt", async () => {
    const { generateValidationSummary } = await import(
      `@/server/services/placements/generate-validation-summary?fresh=${Date.now()}`
    )

    await generateValidationSummary({
      application: { id: "app-1", status: "pending" },
    })

    const callArgs = mockGenerateText.mock.calls[0] as unknown as [
      { prompt: string },
    ]
    expect(callArgs[0].prompt).toContain("app-1")
    expect(callArgs[0].prompt).toContain("pending")
  })
})
