import { beforeEach, describe, expect, mock, test } from "bun:test"

let queryResult: any[] = []

const mockLimit = mock(() => Promise.resolve(queryResult))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

let importCounter = 0
async function importModule() {
  importCounter += 1
  return import(`@/server/services/assistant/get?fresh=${importCounter}`)
}

describe("src/server/services/assistant/get", () => {
  beforeEach(() => {
    queryResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockLimit.mockImplementation(() => Promise.resolve(queryResult))
  })

  test("should return conversation when found", async () => {
    queryResult = [
      {
        id: "conv-1",
        title: "My Chat",
        model: "gpt-4",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: "user-1",
      },
    ]

    const { getAssistantConversationByIdForCompany } = await importModule()
    const result = await getAssistantConversationByIdForCompany({
      conversationId: "conv-1",
      companyId: "company-1",
    })

    expect(result).not.toBeNull()
    expect(result?.id).toBe("conv-1")
    expect(result?.title).toBe("My Chat")
    expect(result?.model).toBe("gpt-4")
  })

  test("should return null when conversation not found", async () => {
    queryResult = []

    const { getAssistantConversationByIdForCompany } = await importModule()
    const result = await getAssistantConversationByIdForCompany({
      conversationId: "missing",
      companyId: "company-1",
    })

    expect(result).toBeNull()
  })

  test("should return null when conversation belongs to different company", async () => {
    queryResult = []

    const { getAssistantConversationByIdForCompany } = await importModule()
    const result = await getAssistantConversationByIdForCompany({
      conversationId: "conv-1",
      companyId: "wrong-company",
    })

    expect(result).toBeNull()
  })
})
