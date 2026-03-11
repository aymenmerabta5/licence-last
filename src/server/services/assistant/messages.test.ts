import { beforeEach, describe, expect, mock, test } from "bun:test"

// --- listAssistantMessages / getLatestAssistantMessage mocks ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let selectQueryResult: any[] = []

const mockSelectLimit = mock(() => Promise.resolve(selectQueryResult))
const mockSelectOrderBy = mock(() => ({
  limit: mockSelectLimit,
  // When no limit is called (listAssistantMessages), orderBy is the terminal
  then: (resolve: (v: unknown) => void) => resolve(selectQueryResult),
}))
const mockSelectWhere = mock(() => ({ orderBy: mockSelectOrderBy }))
const mockSelectInnerJoin = mock(() => ({ where: mockSelectWhere }))
const mockSelectFrom = mock(() => ({ innerJoin: mockSelectInnerJoin }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

// --- appendAssistantMessage mocks ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let verifyConversationResult: any[] = []

const mockVerifyLimit = mock(() => Promise.resolve(verifyConversationResult))
const mockVerifyWhere = mock(() => ({ limit: mockVerifyLimit }))
const mockVerifyFrom = mock(() => ({ where: mockVerifyWhere }))
const mockVerifySelect = mock(() => ({ from: mockVerifyFrom }))

const mockTxValues = mock(() => Promise.resolve())
const mockTxInsert = mock(() => ({ values: mockTxValues }))
const mockTxUpdateWhere = mock(() => Promise.resolve())
const mockTxUpdateSet = mock(() => ({ where: mockTxUpdateWhere }))
const mockTxUpdate = mock(() => ({ set: mockTxUpdateSet }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTransaction = mock(async (fn: (tx: any) => Promise<void>) => {
  await fn({
    insert: mockTxInsert,
    update: mockTxUpdate,
  })
})

// Track which select call we're on: first = verify, subsequent = query
let selectCallCount = 0
const dbSelectRouter = mock(() => {
  selectCallCount++
  if (
    verifyConversationResult.length >= 0 &&
    selectCallCount === 1 &&
    mockTransaction.mock.calls.length === 0
  ) {
    return mockVerifySelect()
  }
  return mockSelect()
})

mock.module("@/server/db", () => ({
  db: {
    select: dbSelectRouter,
    transaction: mockTransaction,
  },
}))

let importCounter = 0
async function importModule() {
  importCounter += 1
  return import(`@/server/services/assistant/messages?fresh=${importCounter}`)
}

describe("src/server/services/assistant/messages — listAssistantMessages", () => {
  beforeEach(() => {
    selectQueryResult = []
    selectCallCount = 0

    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectInnerJoin.mockClear()
    mockSelectWhere.mockClear()
    mockSelectOrderBy.mockClear()
    mockSelectLimit.mockClear()
    dbSelectRouter.mockClear()

    mockSelect.mockReturnValue({ from: mockSelectFrom })
    mockSelectFrom.mockReturnValue({ innerJoin: mockSelectInnerJoin })
    mockSelectInnerJoin.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ orderBy: mockSelectOrderBy })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockSelectOrderBy.mockImplementation((() => {
      const p = Promise.resolve(selectQueryResult)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(p as any).limit = mockSelectLimit
      return p
    }) as any)
    mockSelectLimit.mockImplementation(() => Promise.resolve(selectQueryResult))

    dbSelectRouter.mockImplementation(() => mockSelect())
  })

  test("should return empty messages array for empty conversation", async () => {
    selectQueryResult = []

    const { listAssistantMessages } = await importModule()
    const result = await listAssistantMessages({
      conversationId: "conv-1",
      companyId: "company-1",
    })

    expect(result.messages).toEqual([])
  })

  test("should return messages for a conversation", async () => {
    selectQueryResult = [
      {
        id: "msg-1",
        role: "user",
        text: "Hello",
        parts: [{ type: "text", text: "Hello" }],
        createdAt: new Date(),
      },
      {
        id: "msg-2",
        role: "assistant",
        text: "Hi there",
        parts: [{ type: "text", text: "Hi there" }],
        createdAt: new Date(),
      },
    ]

    const { listAssistantMessages } = await importModule()
    const result = await listAssistantMessages({
      conversationId: "conv-1",
      companyId: "company-1",
    })

    expect(result.messages).toHaveLength(2)
    expect(result.messages[0].role).toBe("user")
    expect(result.messages[1].role).toBe("assistant")
  })
})

describe("src/server/services/assistant/messages — getLatestAssistantMessage", () => {
  beforeEach(() => {
    selectQueryResult = []
    selectCallCount = 0

    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectInnerJoin.mockClear()
    mockSelectWhere.mockClear()
    mockSelectOrderBy.mockClear()
    mockSelectLimit.mockClear()
    dbSelectRouter.mockClear()

    mockSelect.mockReturnValue({ from: mockSelectFrom })
    mockSelectFrom.mockReturnValue({ innerJoin: mockSelectInnerJoin })
    mockSelectInnerJoin.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ orderBy: mockSelectOrderBy })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockSelectOrderBy.mockReturnValue({ limit: mockSelectLimit } as any)
    mockSelectLimit.mockImplementation(() => Promise.resolve(selectQueryResult))

    dbSelectRouter.mockImplementation(() => mockSelect())
  })

  test("should return latest message when it exists", async () => {
    selectQueryResult = [
      {
        id: "msg-3",
        role: "assistant",
        text: "Latest reply",
        createdAt: new Date(),
      },
    ]

    const { getLatestAssistantMessage } = await importModule()
    const result = await getLatestAssistantMessage({
      conversationId: "conv-1",
      companyId: "company-1",
    })

    expect(result).not.toBeNull()
    expect(result?.id).toBe("msg-3")
    expect(result?.text).toBe("Latest reply")
  })

  test("should return null when no messages exist", async () => {
    selectQueryResult = []

    const { getLatestAssistantMessage } = await importModule()
    const result = await getLatestAssistantMessage({
      conversationId: "conv-1",
      companyId: "company-1",
    })

    expect(result).toBeNull()
  })
})

describe("src/server/services/assistant/messages — appendAssistantMessage", () => {
  beforeEach(() => {
    selectCallCount = 0
    verifyConversationResult = []

    mockVerifySelect.mockClear()
    mockVerifyFrom.mockClear()
    mockVerifyWhere.mockClear()
    mockVerifyLimit.mockClear()
    mockTxInsert.mockClear()
    mockTxValues.mockClear()
    mockTxUpdate.mockClear()
    mockTxUpdateSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockTransaction.mockClear()
    dbSelectRouter.mockClear()

    mockVerifySelect.mockReturnValue({ from: mockVerifyFrom })
    mockVerifyFrom.mockReturnValue({ where: mockVerifyWhere })
    mockVerifyWhere.mockReturnValue({ limit: mockVerifyLimit })
    mockVerifyLimit.mockImplementation(() =>
      Promise.resolve(verifyConversationResult),
    )

    mockTxInsert.mockReturnValue({ values: mockTxValues })
    mockTxValues.mockResolvedValue(undefined)
    mockTxUpdate.mockReturnValue({ set: mockTxUpdateSet })
    mockTxUpdateSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockResolvedValue(undefined)
    mockTransaction.mockImplementation(async (fn) => {
      await fn({ insert: mockTxInsert, update: mockTxUpdate })
    })

    // For append: first select is verification
    dbSelectRouter.mockImplementation(() => mockVerifySelect())
  })

  test("should append message and return ok true when conversation exists", async () => {
    verifyConversationResult = [{ id: "conv-1" }]

    const { appendAssistantMessage } = await importModule()
    const result = await appendAssistantMessage({
      conversationId: "conv-1",
      companyId: "company-1",
      role: "user",
      parts: [{ type: "text", text: "Hello world" }],
    })

    expect(result.ok).toBe(true)
    expect(result.messageId).toBeDefined()
    expect(typeof result.messageId).toBe("string")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  test("should return ok false when conversation does not exist", async () => {
    verifyConversationResult = []

    const { appendAssistantMessage } = await importModule()
    const result = await appendAssistantMessage({
      conversationId: "missing",
      companyId: "company-1",
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
    })

    expect(result.ok).toBe(false)
    expect(result.messageId).toBeNull()
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should strip provider metadata and redact secrets from parts", async () => {
    verifyConversationResult = [{ id: "conv-1" }]

    const { appendAssistantMessage } = await importModule()
    await appendAssistantMessage({
      conversationId: "conv-1",
      companyId: "company-1",
      role: "assistant",
      parts: [
        { type: "text", text: "Response", providerMetadata: { x: 1 } },
        { type: "tool-call", token: "secret-val" },
      ],
    })

    expect(mockTxInsert).toHaveBeenCalledTimes(1)
    const insertedValues = (
      mockTxValues.mock.calls[0] as unknown as
        | [Record<string, unknown>]
        | undefined
    )?.[0]

    // providerMetadata should be stripped
    const parts = insertedValues?.parts as Record<string, unknown>[]
    expect(parts[0]).not.toHaveProperty("providerMetadata")
    // token should be redacted
    expect(parts[1]).toHaveProperty("token", "[REDACTED]")
    // text should be extracted correctly
    expect(insertedValues?.text).toBe("Response")
  })

  test("should handle empty parts gracefully", async () => {
    verifyConversationResult = [{ id: "conv-1" }]

    const { appendAssistantMessage } = await importModule()
    const result = await appendAssistantMessage({
      conversationId: "conv-1",
      companyId: "company-1",
      role: "user",
      parts: [],
    })

    expect(result.ok).toBe(true)
    const insertedValues = (
      mockTxValues.mock.calls[0] as unknown as
        | [Record<string, unknown>]
        | undefined
    )?.[0]
    // Empty text should be stored as null
    expect(insertedValues?.text).toBeNull()
  })
})
