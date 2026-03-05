import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let queryResult: any[] = []

const mockLimit = mock(() => Promise.resolve(queryResult))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/assistant/list", () => {
  beforeEach(() => {
    queryResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
    mockLimit.mockImplementation(() => Promise.resolve(queryResult))
  })

  test("should return empty conversations array when none exist", async () => {
    queryResult = []

    const { listAssistantConversationsByCompanyId } = await import(
      "@/server/services/assistant/list?fresh=1"
    )
    const result = await listAssistantConversationsByCompanyId({
      companyId: "company-1",
    })

    expect(result.conversations).toEqual([])
  })

  test("should return conversations for a company", async () => {
    queryResult = [
      {
        id: "conv-1",
        title: "Chat 1",
        model: "gpt-4",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: "user-1",
      },
      {
        id: "conv-2",
        title: "Chat 2",
        model: "gpt-4",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: "user-1",
      },
    ]

    const { listAssistantConversationsByCompanyId } = await import(
      "@/server/services/assistant/list?fresh=2"
    )
    const result = await listAssistantConversationsByCompanyId({
      companyId: "company-1",
    })

    expect(result.conversations).toHaveLength(2)
    expect(result.conversations[0].id).toBe("conv-1")
    expect(result.conversations[1].id).toBe("conv-2")
  })

  test("should use default limit of 50", async () => {
    queryResult = []

    const { listAssistantConversationsByCompanyId } = await import(
      "@/server/services/assistant/list?fresh=3"
    )
    await listAssistantConversationsByCompanyId({ companyId: "company-1" })

    expect(mockLimit).toHaveBeenCalledWith(50)
  })

  test("should respect custom limit parameter", async () => {
    queryResult = []

    const { listAssistantConversationsByCompanyId } = await import(
      "@/server/services/assistant/list?fresh=4"
    )
    await listAssistantConversationsByCompanyId({
      companyId: "company-1",
      limit: 10,
    })

    expect(mockLimit).toHaveBeenCalledWith(10)
  })
})
