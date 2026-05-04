import { beforeEach, describe, expect, mock, test } from "bun:test"

const generateTextMock = mock(() =>
  Promise.resolve({ text: "  \"Drafting Internship Offer\"  " }),
)

mock.module("ai", () => ({
  generateText: generateTextMock,
}))

mock.module("@/server/ai/model", () => ({
  getAIModel: mock((modelId?: string) => ({ modelId: modelId ?? "default" })),
}))

describe("generateConversationTitle", () => {
  beforeEach(() => {
    generateTextMock.mockClear()
  })

  test("returns a cleaned, truncated title when generation succeeds", async () => {
    const { generateConversationTitle } = await import(
      "@/server/ai/auto-title"
    )

    const title = await generateConversationTitle(
      "Help me draft an internship offer for a software engineer",
    )

    expect(title).toBe("Drafting Internship Offer")
    expect(generateTextMock).toHaveBeenCalled()
  })

  test("falls back to a date-based title on generation failure", async () => {
    generateTextMock.mockImplementationOnce(() => {
      throw new Error("Model error")
    })

    const { generateConversationTitle } = await import(
      "@/server/ai/auto-title"
    )

    const title = await generateConversationTitle("Any message")

    expect(title.startsWith("Chat ")).toBe(true)
  })

  test("falls back when model returns empty text", async () => {
    generateTextMock.mockImplementationOnce(() =>
      Promise.resolve({ text: "   " }),
    )

    const { generateConversationTitle } = await import(
      "@/server/ai/auto-title"
    )

    const title = await generateConversationTitle("Any message")

    expect(title.startsWith("Chat ")).toBe(true)
  })
})
