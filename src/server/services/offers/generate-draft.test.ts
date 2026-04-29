import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockGenerateText = mock(async () => ({
  output: {
    title: "Draft Title",
    description: "Draft description",
    internshipType: "pfe",
    workMode: "remote",
    wilayaCode: 16,
    durationWeeks: 12,
    maxPositions: 2,
    applicationDeadlineAt: "2025-06-01",
    expectedStartDate: "2025-07-01",
    expectedEndDate: "2025-09-01",
    suggestedSkillTagIds: ["skill-1"],
    suggestedSkillTagNames: ["React"],
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

describe("src/server/services/offers/generate-draft", () => {
  beforeEach(() => {
    applyMocks()

    mockGenerateText.mockClear()
    mockOutputObject.mockClear()
  })

  test("should return generated draft from AI", async () => {
    const { generateOfferDraft } = await import(
      `@/server/services/offers/generate-draft?fresh=${Date.now()}`
    )

    const result = await generateOfferDraft({
      prompt: "Create a frontend internship",
      title: "Frontend Intern",
      description: "Need a React developer",
      availableSkillTags: [{ id: "skill-1", name: "React" }],
    })

    expect(result.title).toBe("Draft Title")
    expect(result.description).toBe("Draft description")
    expect(result.internshipType).toBe("pfe")
    expect(result.workMode).toBe("remote")
    expect(result.wilayaCode).toBe(16)
    expect(result.durationWeeks).toBe(12)
    expect(result.maxPositions).toBe(2)
    expect(result.applicationDeadlineAt).toBe("2025-06-01")
    expect(result.expectedStartDate).toBe("2025-07-01")
    expect(result.expectedEndDate).toBe("2025-09-01")
    expect(result.suggestedSkillTagIds).toEqual(["skill-1"])
    expect(result.suggestedSkillTagNames).toEqual(["React"])
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  test("should pass available skills in the prompt", async () => {
    const { generateOfferDraft } = await import(
      `@/server/services/offers/generate-draft?fresh=${Date.now()}`
    )

    await generateOfferDraft({
      prompt: "Create an internship",
      availableSkillTags: [
        { id: "skill-1", name: "React" },
        { id: "skill-2", name: "Node.js" },
      ],
    })

    const callArgs = mockGenerateText.mock.calls[0] as unknown as [
      { prompt: string },
    ]
    expect(callArgs[0].prompt).toContain("skill-1:React")
    expect(callArgs[0].prompt).toContain("skill-2:Node.js")
  })

  test("should handle empty skill tags", async () => {
    const { generateOfferDraft } = await import(
      `@/server/services/offers/generate-draft?fresh=${Date.now()}`
    )

    await generateOfferDraft({
      prompt: "Create an internship",
      availableSkillTags: [],
    })

    const callArgs = mockGenerateText.mock.calls[0] as unknown as [
      { prompt: string },
    ]
    expect(callArgs[0].prompt).toContain("No skill tags available")
  })
})
