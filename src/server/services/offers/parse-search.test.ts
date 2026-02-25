import { beforeEach, describe, expect, mock, test } from "bun:test"

import type { ParseSearchResult } from "@/server/services/offers/parse-search"

const mockGenerateText = mock()
const mockGetAIModel = mock(() => "poe-model")

mock.module("ai", () => ({
  generateText: mockGenerateText,
  Output: {
    object: ({ schema }: { schema: unknown }) => ({ schema }),
  },
  convertToModelMessages: <T>(messages: T) => messages,
  tool: <T>(definition: T) => definition,
  createUIMessageStream: ({
    execute,
  }: {
    execute: (args: {
      writer: { write: (chunk: string) => void }
    }) => Promise<void>
  }) =>
    new ReadableStream({
      start(controller) {
        const writer = {
          write: (chunk: string) =>
            controller.enqueue(new TextEncoder().encode(chunk)),
        }
        execute({ writer })
          .then(() => controller.close())
          .catch(() => controller.close())
      },
    }),
  createUIMessageStreamResponse: ({ stream }: { stream: ReadableStream }) =>
    new Response(stream),
  stepCountIs: () => () => false,
  streamText: () => ({
    async *toUIMessageStream() {
      yield { role: "assistant", content: "ok" }
    },
  }),
}))

mock.module("@/server/ai/model", () => ({
  getAIModel: mockGetAIModel,
  getAllowedModelIds: () => ["poe-model"],
  getDefaultModelId: () => "poe-model",
  isAllowedModelId: (value: string) => value === "poe-model",
}))

describe("src/server/services/offers/parse-search", () => {
  beforeEach(() => {
    mockGenerateText.mockClear()
    mockGetAIModel.mockClear()
  })

  test("returns parsed object from generateText", async () => {
    const expected: ParseSearchResult = {
      keyword: "react",
      wilayaCode: 16,
      internshipTypes: ["summer"],
      workModes: ["remote"],
      skillTagIds: ["skill-1"],
      explanation: "matches intent",
    }
    mockGenerateText.mockResolvedValueOnce({ output: expected })

    const { parseSearchQuery } = await import(
      "@/server/services/offers/parse-search"
    )
    const result = await parseSearchQuery({
      query: "remote summer react internship in Alger",
      availableSkillTags: [{ id: "skill-1", name: "React" }],
    })

    expect(result).toEqual(expected)
    expect(mockGetAIModel).toHaveBeenCalledTimes(1)
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  test("builds prompt context with fallback when no skill tags are available", async () => {
    mockGenerateText.mockResolvedValueOnce({
      output: {
        internshipTypes: [],
        workModes: [],
        skillTagIds: [],
      },
    })

    const { parseSearchQuery } = await import(
      "@/server/services/offers/parse-search"
    )
    await parseSearchQuery({
      query: "anything",
      availableSkillTags: [],
    })

    const firstCallArg = mockGenerateText.mock.calls[0]?.[0] as {
      prompt: string
    }

    expect(firstCallArg.prompt).toContain("No skill tags available.")
    expect(firstCallArg.prompt).toContain("Context JSON:")
    expect(firstCallArg.prompt).toContain('"query":"anything"')
  })
})
