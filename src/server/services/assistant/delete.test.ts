import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let selectResult: any[] = []

const mockLimit = mock(() => Promise.resolve(selectResult))
const mockSelectWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockDeleteWhere = mock(() => Promise.resolve())
const mockDelete = mock(() => ({ where: mockDeleteWhere }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    delete: mockDelete,
  },
}))

describe("src/server/services/assistant/delete", () => {
  beforeEach(() => {
    selectResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockLimit.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })
    mockLimit.mockImplementation(() => Promise.resolve(selectResult))
    mockDelete.mockReturnValue({ where: mockDeleteWhere })
    mockDeleteWhere.mockResolvedValue(undefined)
  })

  test("should delete conversation and return deletedCount 1", async () => {
    selectResult = [{ id: "conv-1" }]

    const { deleteAssistantConversation } = await import(
      "@/server/services/assistant/delete?fresh=1"
    )
    const result = await deleteAssistantConversation({
      conversationId: "conv-1",
      companyId: "company-1",
    })

    expect(result.deletedCount).toBe(1)
    // Should delete messages then conversation (2 delete calls)
    expect(mockDelete).toHaveBeenCalledTimes(2)
  })

  test("should return deletedCount 0 when conversation not found", async () => {
    selectResult = []

    const { deleteAssistantConversation } = await import(
      "@/server/services/assistant/delete?fresh=2"
    )
    const result = await deleteAssistantConversation({
      conversationId: "missing",
      companyId: "company-1",
    })

    expect(result.deletedCount).toBe(0)
    // Should not attempt any deletes
    expect(mockDelete).not.toHaveBeenCalled()
  })

  test("should delete messages before deleting conversation", async () => {
    selectResult = [{ id: "conv-1" }]
    const deleteCalls: string[] = []

    mockDelete.mockImplementation((..._args: unknown[]) => {
      deleteCalls.push("delete")
      return { where: mockDeleteWhere }
    })

    const { deleteAssistantConversation } = await import(
      "@/server/services/assistant/delete?fresh=3"
    )
    await deleteAssistantConversation({
      conversationId: "conv-1",
      companyId: "company-1",
    })

    // Two deletes: messages first, then conversation
    expect(deleteCalls).toHaveLength(2)
  })
})
