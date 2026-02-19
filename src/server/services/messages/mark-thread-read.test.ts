import { beforeEach, describe, expect, mock, test } from "bun:test"

import {
  MessageServiceError,
  type MessageServiceErrorCode,
} from "@/server/services/messages/errors"

const dbSelectResults: unknown[][] = []
let dbSelectCallIdx = 0

const dbLimit1 = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const dbWhere1 = mock(() => ({ limit: dbLimit1 }))
const dbFrom1 = mock(() => ({ where: dbWhere1 }))

const dbLimit2 = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const dbOrderBy2 = mock(() => ({ limit: dbLimit2 }))
const dbWhere2 = mock(() => ({ orderBy: dbOrderBy2 }))
const dbFrom2 = mock(() => ({ where: dbWhere2 }))

const dbSelect = mock(() => {
  dbSelectCallIdx += 1
  if (dbSelectCallIdx === 1) {
    return { from: dbFrom1 }
  }

  return { from: dbFrom2 }
})

const dbOnConflictDoUpdate = mock(() => Promise.resolve())
const dbValues = mock(() => ({ onConflictDoUpdate: dbOnConflictDoUpdate }))
const dbInsert = mock(() => ({ values: dbValues }))

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
    insert: dbInsert,
  },
}))

async function expectMessageError(
  operation: Promise<unknown>,
  code: MessageServiceErrorCode,
  message: string,
) {
  let thrown: unknown
  try {
    await operation
  } catch (error) {
    thrown = error
  }

  expect(thrown).toBeInstanceOf(MessageServiceError)
  expect(thrown).toMatchObject({ code, message })
}

describe("src/server/services/messages/mark-thread-read", () => {
  beforeEach(() => {
    dbSelectResults.length = 0
    dbSelectCallIdx = 0

    dbSelect.mockClear()
    dbFrom1.mockClear()
    dbWhere1.mockClear()
    dbLimit1.mockClear()
    dbFrom2.mockClear()
    dbWhere2.mockClear()
    dbOrderBy2.mockClear()
    dbLimit2.mockClear()
    dbInsert.mockClear()
    dbValues.mockClear()
    dbOnConflictDoUpdate.mockClear()

    dbFrom1.mockReturnValue({ where: dbWhere1 })
    dbWhere1.mockReturnValue({ limit: dbLimit1 })

    dbFrom2.mockReturnValue({ where: dbWhere2 })
    dbWhere2.mockReturnValue({ orderBy: dbOrderBy2 })
    dbOrderBy2.mockReturnValue({ limit: dbLimit2 })

    dbInsert.mockReturnValue({ values: dbValues })
    dbValues.mockReturnValue({ onConflictDoUpdate: dbOnConflictDoUpdate })
    dbOnConflictDoUpdate.mockResolvedValue(undefined)
  })

  test("should throw typed error when thread does not exist", async () => {
    dbSelectResults.push([])

    const { markThreadRead } = await import(
      "@/server/services/messages/mark-thread-read?fresh=1" as string
    )

    await expectMessageError(
      markThreadRead("thread-1", {
        userId: "student-1",
        role: "student",
      }),
      "THREAD_NOT_FOUND",
      "Message thread not found",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbInsert).not.toHaveBeenCalled()
  })

  test("should throw typed error when student cannot access thread", async () => {
    dbSelectResults.push([
      {
        id: "thread-1",
        companyId: "company-1",
        studentUserId: "student-2",
      },
    ])

    const { markThreadRead } = await import(
      "@/server/services/messages/mark-thread-read?fresh=2" as string
    )

    await expectMessageError(
      markThreadRead("thread-1", {
        userId: "student-1",
        role: "student",
      }),
      "THREAD_FORBIDDEN",
      "You do not have access to this thread",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbInsert).not.toHaveBeenCalled()
  })

  test("should throw typed error when company admin has no matching company access", async () => {
    dbSelectResults.push([
      {
        id: "thread-1",
        companyId: "company-1",
        studentUserId: "student-1",
      },
    ])

    const { markThreadRead } = await import(
      "@/server/services/messages/mark-thread-read?fresh=3" as string
    )

    await expectMessageError(
      markThreadRead("thread-1", {
        userId: "admin-1",
        role: "company_admin",
      }),
      "THREAD_FORBIDDEN",
      "You do not have access to this thread",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbInsert).not.toHaveBeenCalled()
  })

  test("should return marked false when thread has no messages yet", async () => {
    dbSelectResults.push([
      {
        id: "thread-1",
        companyId: "company-1",
        studentUserId: "student-1",
      },
    ])
    dbSelectResults.push([])

    const { markThreadRead } = await import(
      "@/server/services/messages/mark-thread-read?fresh=4" as string
    )

    const result = await markThreadRead("thread-1", {
      userId: "student-1",
      role: "student",
    })

    expect(result).toEqual({ threadId: "thread-1", marked: false })
    expect(dbSelect).toHaveBeenCalledTimes(2)
    expect(dbInsert).not.toHaveBeenCalled()
  })

  test("should upsert read state and return marked true when messages exist", async () => {
    const lastMessageCreatedAt = new Date("2030-01-01T10:00:00.000Z")

    dbSelectResults.push([
      {
        id: "thread-1",
        companyId: "company-1",
        studentUserId: "student-1",
      },
    ])
    dbSelectResults.push([
      {
        id: "message-1",
        createdAt: lastMessageCreatedAt,
      },
    ])

    const { markThreadRead } = await import(
      "@/server/services/messages/mark-thread-read?fresh=5" as string
    )

    const result = await markThreadRead("thread-1", {
      userId: "admin-1",
      role: "company_admin",
      companyId: "company-1",
    })

    expect(result).toEqual({ threadId: "thread-1", marked: true })
    expect(dbSelect).toHaveBeenCalledTimes(2)
    expect(dbInsert).toHaveBeenCalledTimes(1)
    expect(dbValues).toHaveBeenCalledTimes(1)
    expect(dbOnConflictDoUpdate).toHaveBeenCalledTimes(1)

    const dbValuesCalls = dbValues.mock.calls as unknown as unknown[][]
    const dbOnConflictCalls = dbOnConflictDoUpdate.mock
      .calls as unknown as unknown[][]

    const valuesPayload = dbValuesCalls[0]?.[0] as {
      threadId: string
      userId: string
      lastReadMessageId: string
      lastReadAt: Date
    }
    const onConflictPayload = dbOnConflictCalls[0]?.[0] as {
      target: unknown[]
      set: {
        lastReadMessageId: string
        lastReadAt: Date
        updatedAt: Date
      }
    }

    expect(valuesPayload.threadId).toBe("thread-1")
    expect(valuesPayload.userId).toBe("admin-1")
    expect(valuesPayload.lastReadMessageId).toBe("message-1")
    expect(valuesPayload.lastReadAt).toBeInstanceOf(Date)

    expect(onConflictPayload.target).toHaveLength(2)
    expect(onConflictPayload.set.lastReadMessageId).toBe("message-1")
    expect(onConflictPayload.set.lastReadAt).toBeInstanceOf(Date)
    expect(onConflictPayload.set.updatedAt).toBeInstanceOf(Date)
  })
})
