import { beforeEach, describe, expect, mock, test } from "bun:test"

const chatMock = mock((modelId: string) => ({ modelId }))
const createOpenAIMock = mock(() => ({
  chat: chatMock,
}))

mock.module("@ai-sdk/openai", () => ({
  createOpenAI: createOpenAIMock,
}))

describe("src/server/ai/model", () => {
  beforeEach(() => {
    chatMock.mockClear()
    createOpenAIMock.mockClear()
  })

  test("throws a clear error when no AI provider key is configured", async () => {
    mock.module("@/env", () => ({
      env: {
        AI_PROVIDER: undefined,
        AI_API_KEY: undefined,
        AI_MODEL: undefined,
        AI_ALLOWED_MODELS: undefined,
        AI_BASE_URL: undefined,
      },
    }))

    const modulePath = "@/server/ai/model?no-key=1" as string
    const { getAIModel } = await import(modulePath)

    expect(() => getAIModel()).toThrow("AI provider is not configured")
    expect(chatMock).not.toHaveBeenCalled()
  })

  test("returns a model when an AI provider key is configured", async () => {
    mock.module("@/env", () => ({
      env: {
        AI_PROVIDER: "gateway",
        AI_API_KEY: "key-123",
        AI_MODEL: "openai/gpt-4o-mini",
        AI_ALLOWED_MODELS: undefined,
        AI_BASE_URL: undefined,
      },
    }))

    const modulePath = "@/server/ai/model?with-key=1" as string
    const { getAIModel } = await import(modulePath)

    expect(getAIModel()).toEqual({ modelId: "openai/gpt-4o-mini" })
    expect(chatMock).toHaveBeenCalledWith("openai/gpt-4o-mini")
  })
})
