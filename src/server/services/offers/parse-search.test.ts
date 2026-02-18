import { beforeEach, describe, expect, mock, test } from "bun:test"

import type { ParseSearchResult } from "@/server/services/offers/parse-search"

const mockGenerateObject = mock()
const mockGetPoeModel = mock(() => "poe-model")

mock.module("ai", () => ({
  generateObject: mockGenerateObject,
  convertToModelMessages: <T>(messages: T) => messages,
  tool: <T>(definition: T) => definition,
  createUIMessageStream: ({ execute }: { execute: (args: { writer: { write: (chunk: string) => void } }) => Promise<void> }) =>
    new ReadableStream({
      start(controller) {
        const writer = {
          write: (chunk: string) => controller.enqueue(new TextEncoder().encode(chunk)),
        }
        execute({ writer }).then(() => controller.close()).catch(() => controller.close())
      },
    }),
  createUIMessageStreamResponse: ({ stream }: { stream: ReadableStream }) => new Response(stream),
  stepCountIs: () => () => false,
  streamText: () => ({
    async *toUIMessageStream() {
      yield { role: "assistant", content: "ok" }
    },
  }),
}))

mock.module("@/server/ai/model", () => ({
  getPoeModel: mockGetPoeModel,
  getAllowedPoeModelIds: () => ["poe-model"],
  getDefaultPoeModelId: () => "poe-model",
  isAllowedPoeModelId: (value: string) => value === "poe-model",
}))

describe("src/server/services/offers/parse-search", () => {
  beforeEach(() => {
    mockGenerateObject.mockClear()
    mockGetPoeModel.mockClear()
  })

  test("returns parsed object from generateObject", async () => {
    const expected: ParseSearchResult = {
      keyword: "react",
      wilayaCode: 16,
      internshipTypes: ["summer"],
      workModes: ["remote"],
      skillTagIds: ["skill-1"],
      explanation: "matches intent",
    }
    mockGenerateObject.mockResolvedValueOnce({ object: expected })

    const { parseSearchQuery } = await import("@/server/services/offers/parse-search")
    const result = await parseSearchQuery({
      query: "remote summer react internship in Alger",
      availableSkillTags: [{ id: "skill-1", name: "React" }],
    })

    expect(result).toEqual(expected)
    expect(mockGetPoeModel).toHaveBeenCalledTimes(1)
    expect(mockGenerateObject).toHaveBeenCalledTimes(1)
  })

  test("builds prompt context with fallback when no skill tags are available", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        internshipTypes: [],
        workModes: [],
        skillTagIds: [],
      },
    })

    const { parseSearchQuery } = await import("@/server/services/offers/parse-search")
    await parseSearchQuery({
      query: "anything",
      availableSkillTags: [],
    })

    const firstCallArg = mockGenerateObject.mock.calls[0]?.[0] as {
      prompt: string
    }

    expect(firstCallArg.prompt).toContain("No skill tags available.")
    expect(firstCallArg.prompt).toContain("Context JSON:")
    expect(firstCallArg.prompt).toContain("\"query\":\"anything\"")
  })
})
