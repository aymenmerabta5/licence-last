import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockGenerateText = mock(async () => ({
  output: {
    skillTagIds: ["skill-1", "skill-2"],
    skillTagNames: ["TypeScript"],
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

describe("src/server/services/offers/suggest-skills", () => {
  beforeEach(() => {
    applyMocks()

    mockGenerateText.mockClear()
    mockOutputObject.mockClear()
  })

  test("should return suggested skills from AI", async () => {
    const { suggestOfferSkills } = await import(
      `@/server/services/offers/suggest-skills?fresh=${Date.now()}`
    )

    const result = await suggestOfferSkills({
      title: "Frontend Intern",
      description: "React work",
      internshipType: "pfe",
      availableSkillTags: [
        { id: "skill-1", name: "React" },
        { id: "skill-2", name: "TypeScript" },
      ],
    })

    expect(result.skillTagIds).toEqual(["skill-1", "skill-2"])
    expect(result.skillTagNames).toEqual(["TypeScript"])
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  test("should pass available skills in the prompt", async () => {
    const { suggestOfferSkills } = await import(
      `@/server/services/offers/suggest-skills?fresh=${Date.now()}`
    )

    await suggestOfferSkills({
      title: "Backend Intern",
      availableSkillTags: [
        { id: "skill-1", name: "Node.js" },
        { id: "skill-2", name: "PostgreSQL" },
      ],
    })

    const callArgs = mockGenerateText.mock.calls[0] as unknown as [
      { prompt: string },
    ]
    expect(callArgs[0].prompt).toContain("skill-1:Node.js")
    expect(callArgs[0].prompt).toContain("skill-2:PostgreSQL")
  })

  test("should handle empty skill tags", async () => {
    const { suggestOfferSkills } = await import(
      `@/server/services/offers/suggest-skills?fresh=${Date.now()}`
    )

    await suggestOfferSkills({
      title: "Generic Intern",
      availableSkillTags: [],
    })

    const callArgs = mockGenerateText.mock.calls[0] as unknown as [
      { prompt: string },
    ]
    expect(callArgs[0].prompt).toContain("No skill tags available")
  })
})
