import { beforeEach, describe, expect, mock, test } from "bun:test"

let returningResult: any[] = []

const mockReturning = mock(() => Promise.resolve(returningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

mock.module("@/server/db", () => ({
  db: {
    update: mockUpdate,
  },
}))

let importCounter = 0
async function importModule() {
  importCounter += 1
  return import(`@/server/services/assistant/update?fresh=${importCounter}`)
}

describe("src/server/services/assistant/update — updateAssistantConversationModel", () => {
  beforeEach(() => {
    returningResult = []
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockImplementation(() => Promise.resolve(returningResult))
  })

  test("should return updatedCount 1 when conversation exists", async () => {
    returningResult = [{ id: "conv-1" }]

    const { updateAssistantConversationModel } = await importModule()
    const result = await updateAssistantConversationModel({
      conversationId: "conv-1",
      companyId: "company-1",
      model: "claude-3",
    })

    expect(result.updatedCount).toBe(1)
  })

  test("should return updatedCount 0 when conversation not found", async () => {
    returningResult = []

    const { updateAssistantConversationModel } = await importModule()
    const result = await updateAssistantConversationModel({
      conversationId: "missing",
      companyId: "company-1",
      model: "claude-3",
    })

    expect(result.updatedCount).toBe(0)
  })
})

describe("src/server/services/assistant/update — updateAssistantConversationTitle", () => {
  beforeEach(() => {
    returningResult = []
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockImplementation(() => Promise.resolve(returningResult))
  })

  test("should return updatedCount 1 when title is updated", async () => {
    returningResult = [{ id: "conv-1" }]

    const { updateAssistantConversationTitle } = await importModule()
    const result = await updateAssistantConversationTitle({
      conversationId: "conv-1",
      companyId: "company-1",
      title: "New Title",
    })

    expect(result.updatedCount).toBe(1)
  })

  test("should allow setting title to null", async () => {
    returningResult = [{ id: "conv-1" }]

    const { updateAssistantConversationTitle } = await importModule()
    const result = await updateAssistantConversationTitle({
      conversationId: "conv-1",
      companyId: "company-1",
      title: null,
    })

    expect(result.updatedCount).toBe(1)
  })

  test("should return updatedCount 0 when conversation not found", async () => {
    returningResult = []

    const { updateAssistantConversationTitle } = await importModule()
    const result = await updateAssistantConversationTitle({
      conversationId: "missing",
      companyId: "company-1",
      title: "Title",
    })

    expect(result.updatedCount).toBe(0)
  })
})
