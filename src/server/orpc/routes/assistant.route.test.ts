import { beforeEach, describe, expect, mock, test } from "bun:test"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const createAssistantConversationMock = mock(async () => ({
  conversationId: "conv-1",
}))
const appendAssistantMessageMock = mock(async () => ({ messageId: "msg-1" }))
const listAssistantConversationsByCompanyIdMock = mock(async () => ({
  conversations: [],
}))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  companyAdminProcedureAssistant: createProcedureMock(),
}))

mock.module("@/server/ai/model", () => ({
  getPoeModel: () => "model-a",
  getAllowedPoeModelIds: () => ["model-a", "model-b"],
  getDefaultPoeModelId: () => "model-a",
  isAllowedPoeModelId: (value: string) => value.startsWith("model-"),
}))

mock.module("@/server/services/assistant/create", () => ({
  createAssistantConversation: createAssistantConversationMock,
}))
mock.module("@/server/services/assistant/delete", () => ({
  deleteAssistantConversation: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/assistant/get", () => ({
  getAssistantConversationByIdForCompany: mock(async () => null),
}))
mock.module("@/server/services/assistant/list", () => ({
  listAssistantConversationsByCompanyId:
    listAssistantConversationsByCompanyIdMock,
}))
mock.module("@/server/services/assistant/messages", () => ({
  appendAssistantMessage: appendAssistantMessageMock,
  listAssistantMessages: mock(async () => ({ messages: [] })),
}))
mock.module("@/server/services/assistant/update", () => ({
  updateAssistantConversationModel: mock(async () => ({ success: true })),
  updateAssistantConversationTitle: mock(async () => ({ success: true })),
}))

describe("src/server/orpc/routes/assistant", () => {
  beforeEach(() => {
    createAssistantConversationMock.mockClear()
    appendAssistantMessageMock.mockClear()
    listAssistantConversationsByCompanyIdMock.mockClear()
  })

  test("listAssistantModelsProcedure returns allowed models", async () => {
    const { listAssistantModelsProcedure } = await import(
      "@/server/orpc/routes/assistant"
    )

    const result = await callProcedure(listAssistantModelsProcedure, {
      input: undefined,
    })

    expect(result).toEqual({
      models: [
        { id: "model-a", label: "model-a" },
        { id: "model-b", label: "model-b" },
      ],
      defaultModelId: "model-a",
    })
  })

  test("createAssistantConversationProcedure delegates with company and user context", async () => {
    const { createAssistantConversationProcedure } = await import(
      "@/server/orpc/routes/assistant"
    )

    const result = await callProcedure(createAssistantConversationProcedure, {
      input: { title: "New chat", model: "model-a" },
      context: {
        user: { id: "user-1" },
        companyMembership: { companyId: "company-1" },
      },
    })

    expect(result).toEqual({ conversationId: "conv-1" })
    expect(createAssistantConversationMock).toHaveBeenCalledWith({
      companyId: "company-1",
      createdByUserId: "user-1",
      title: "New chat",
      model: "model-a",
    })
  })

  test("appendAssistantMessageProcedure delegates to message service", async () => {
    const { appendAssistantMessageProcedure } = await import(
      "@/server/orpc/routes/assistant"
    )

    const result = await callProcedure(appendAssistantMessageProcedure, {
      input: {
        conversationId: "conv-1",
        role: "user",
        parts: [{ type: "text", text: "Hi" }],
      },
      context: { companyMembership: { companyId: "company-1" } },
    })

    expect(result).toEqual({ messageId: "msg-1" })
    expect(appendAssistantMessageMock).toHaveBeenCalledWith({
      conversationId: "conv-1",
      companyId: "company-1",
      role: "user",
      parts: [{ type: "text", text: "Hi" }],
    })
  })
})
