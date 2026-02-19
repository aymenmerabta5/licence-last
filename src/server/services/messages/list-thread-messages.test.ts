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

const dbOrderBy2 = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const dbWhere2 = mock(() => ({ orderBy: dbOrderBy2 }))
const dbInnerJoin2 = mock(() => ({ where: dbWhere2 }))
const dbFrom2 = mock(() => ({ innerJoin: dbInnerJoin2 }))

const dbLimit3 = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const dbWhere3 = mock(() => ({ limit: dbLimit3 }))
const dbFrom3 = mock(() => ({ where: dbWhere3 }))

const dbSelect = mock(() => {
  dbSelectCallIdx += 1
  if (dbSelectCallIdx === 1) {
    return { from: dbFrom1 }
  }

  if (dbSelectCallIdx === 2) {
    return { from: dbFrom2 }
  }

  return { from: dbFrom3 }
})

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
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

describe("src/server/services/messages/list-thread-messages", () => {
  beforeEach(() => {
    dbSelectResults.length = 0
    dbSelectCallIdx = 0

    dbSelect.mockClear()
    dbFrom1.mockClear()
    dbWhere1.mockClear()
    dbLimit1.mockClear()
    dbFrom2.mockClear()
    dbInnerJoin2.mockClear()
    dbWhere2.mockClear()
    dbOrderBy2.mockClear()
    dbFrom3.mockClear()
    dbWhere3.mockClear()
    dbLimit3.mockClear()

    dbFrom1.mockReturnValue({ where: dbWhere1 })
    dbWhere1.mockReturnValue({ limit: dbLimit1 })

    dbFrom2.mockReturnValue({ innerJoin: dbInnerJoin2 })
    dbInnerJoin2.mockReturnValue({ where: dbWhere2 })
    dbWhere2.mockReturnValue({ orderBy: dbOrderBy2 })

    dbFrom3.mockReturnValue({ where: dbWhere3 })
    dbWhere3.mockReturnValue({ limit: dbLimit3 })
  })

  test("should throw typed error when thread does not exist", async () => {
    dbSelectResults.push([])

    const { listThreadMessages } = await import(
      "@/server/services/messages/list-thread-messages?fresh=1" as string
    )

    await expectMessageError(
      listThreadMessages("thread-1", {
        userId: "student-1",
        role: "student",
      }),
      "THREAD_NOT_FOUND",
      "Message thread not found",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbOrderBy2).not.toHaveBeenCalled()
  })

  test("should throw typed error when student tries to access another student's thread", async () => {
    dbSelectResults.push([
      {
        id: "thread-1",
        offerId: "offer-1",
        companyId: "company-1",
        studentUserId: "student-2",
        lastMessageAt: new Date("2030-01-01T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
      },
    ])

    const { listThreadMessages } = await import(
      "@/server/services/messages/list-thread-messages?fresh=2" as string
    )

    await expectMessageError(
      listThreadMessages("thread-1", {
        userId: "student-1",
        role: "student",
      }),
      "THREAD_FORBIDDEN",
      "You do not have access to this thread",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbOrderBy2).not.toHaveBeenCalled()
  })

  test("should throw typed error when company admin has no access to thread", async () => {
    dbSelectResults.push([
      {
        id: "thread-1",
        offerId: "offer-1",
        companyId: "company-1",
        studentUserId: "student-1",
        lastMessageAt: new Date("2030-01-01T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
      },
    ])

    const { listThreadMessages } = await import(
      "@/server/services/messages/list-thread-messages?fresh=3" as string
    )

    await expectMessageError(
      listThreadMessages("thread-1", {
        userId: "admin-1",
        role: "company_admin",
      }),
      "THREAD_FORBIDDEN",
      "You do not have access to this thread",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbOrderBy2).not.toHaveBeenCalled()
  })

  test("should return messages with null read state when viewer has not read yet", async () => {
    const thread = {
      id: "thread-1",
      offerId: "offer-1",
      companyId: "company-1",
      studentUserId: "student-1",
      lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
      createdAt: new Date("2030-01-01T00:00:00.000Z"),
    }
    const messages = [
      {
        id: "message-1",
        senderUserId: "student-1",
        body: "Hello",
        createdAt: new Date("2030-01-01T12:00:00.000Z"),
        senderName: "Student",
        senderImage: null,
      },
      {
        id: "message-2",
        senderUserId: "admin-1",
        body: "Hi back",
        createdAt: new Date("2030-01-01T12:05:00.000Z"),
        senderName: "Admin",
        senderImage: "https://example.com/admin.png",
      },
    ]

    dbSelectResults.push([thread])
    dbSelectResults.push(messages)
    dbSelectResults.push([])

    const { listThreadMessages } = await import(
      "@/server/services/messages/list-thread-messages?fresh=4" as string
    )

    const result = await listThreadMessages("thread-1", {
      userId: "student-1",
      role: "student",
    })

    expect(result.thread).toEqual(thread)
    expect(result.messages).toEqual(messages)
    expect(result.readState).toBeNull()
    expect(dbSelect).toHaveBeenCalledTimes(3)
  })

  test("should return messages with read state for authorized company admin", async () => {
    const thread = {
      id: "thread-1",
      offerId: "offer-1",
      companyId: "company-1",
      studentUserId: "student-1",
      lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
      createdAt: new Date("2030-01-01T00:00:00.000Z"),
    }
    const readState = {
      lastReadMessageId: "message-2",
      lastReadAt: new Date("2030-01-01T12:05:00.000Z"),
    }

    dbSelectResults.push([thread])
    dbSelectResults.push([])
    dbSelectResults.push([readState])

    const { listThreadMessages } = await import(
      "@/server/services/messages/list-thread-messages?fresh=5" as string
    )

    const result = await listThreadMessages("thread-1", {
      userId: "admin-1",
      role: "company_admin",
      companyId: "company-1",
    })

    expect(result.thread.id).toBe("thread-1")
    expect(result.messages).toEqual([])
    expect(result.readState).toEqual(readState)
    expect(dbSelect).toHaveBeenCalledTimes(3)
  })
})
