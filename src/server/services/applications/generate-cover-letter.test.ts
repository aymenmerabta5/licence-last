import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockGenerateText = mock(async () => ({
  text: "Dear Hiring Manager, I am excited to apply...",
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

describe("src/server/services/applications/generate-cover-letter", () => {
  beforeEach(() => {
    applyMocks()

    mockGenerateText.mockClear()
    mockOutputObject.mockClear()
  })

  test("should return generated cover letter from AI", async () => {
    const { generateCoverLetter } = await import(
      `@/server/services/applications/generate-cover-letter?fresh=${Date.now()}`
    )

    const result = await generateCoverLetter({
      offerTitle: "Frontend Intern",
      offerDescription: "React work",
      internshipType: "pfe",
      workMode: "remote",
      skills: ["React", "TypeScript"],
      companyName: "Acme",
      companyDescription: "A tech company",
    })

    expect(result.coverLetter).toBe(
      "Dear Hiring Manager, I am excited to apply...",
    )
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  test("should include all context in the prompt", async () => {
    const { generateCoverLetter } = await import(
      `@/server/services/applications/generate-cover-letter?fresh=${Date.now()}`
    )

    await generateCoverLetter({
      offerTitle: "Backend Intern",
      offerDescription: "Node.js work",
      internshipType: "summer",
      workMode: "on_site",
      skills: ["Node.js", "PostgreSQL"],
      companyName: "TechCo",
      companyDescription: "A growing startup",
      currentCoverLetter: "Draft version",
    })

    const callArgs = mockGenerateText.mock.calls[0] as unknown as [
      { prompt: string },
    ]
    expect(callArgs[0].prompt).toContain("Backend Intern")
    expect(callArgs[0].prompt).toContain("Node.js work")
    expect(callArgs[0].prompt).toContain("TechCo")
    expect(callArgs[0].prompt).toContain("Draft version")
  })

  test("should handle null currentCoverLetter", async () => {
    const { generateCoverLetter } = await import(
      `@/server/services/applications/generate-cover-letter?fresh=${Date.now()}`
    )

    const result = await generateCoverLetter({
      offerTitle: "Intern",
      offerDescription: "Desc",
      skills: [],
      companyName: "Co",
      currentCoverLetter: null,
    })

    expect(result.coverLetter).toBeDefined()
  })
})
