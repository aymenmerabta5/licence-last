import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))

mock.module("@/server/db", () => ({
  db: {
    insert: mockInsert,
  },
}))

describe("src/server/services/assistant/create", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should create a conversation and return values with generated id", async () => {
    const { createAssistantConversation } = await import(
      "@/server/services/assistant/create?fresh=1"
    )

    const result = await createAssistantConversation({
      companyId: "company-1",
      createdByUserId: "user-1",
      model: "gpt-4",
    })

    expect(result.id).toBeDefined()
    expect(typeof result.id).toBe("string")
    expect(result.companyId).toBe("company-1")
    expect(result.createdByUserId).toBe("user-1")
    expect(result.model).toBe("gpt-4")
    expect(result.title).toBeNull()
  })

  test("should use provided title when given", async () => {
    const { createAssistantConversation } = await import(
      "@/server/services/assistant/create?fresh=2"
    )

    const result = await createAssistantConversation({
      companyId: "company-1",
      createdByUserId: "user-1",
      title: "My Chat",
      model: "gpt-4",
    })

    expect(result.title).toBe("My Chat")
  })

  test("should call db.insert with correct values", async () => {
    const { createAssistantConversation } = await import(
      "@/server/services/assistant/create?fresh=3"
    )

    await createAssistantConversation({
      companyId: "company-2",
      createdByUserId: "user-2",
      model: "claude-3",
    })

    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockValues).toHaveBeenCalledTimes(1)

    const insertedValues = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>] | undefined
    )?.[0]

    expect(insertedValues).toMatchObject({
      companyId: "company-2",
      createdByUserId: "user-2",
      model: "claude-3",
      title: null,
    })
    expect(insertedValues?.id).toBeDefined()
  })
})
