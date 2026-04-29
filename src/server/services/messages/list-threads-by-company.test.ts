import { beforeEach, describe, expect, mock, test } from "bun:test"

import {
  MessageServiceError,
  type MessageServiceErrorCode,
} from "@/server/services/messages/errors"

const dbSelectResults: unknown[][] = []
let dbSelectCallIdx = 0
let shouldUseOfferLookupFirst = false
let dbExecuteRows: unknown[] = []

const dbExecute = mock(() => Promise.resolve(dbExecuteRows))

const offerLimit = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const offerWhere = mock(() => ({ limit: offerLimit }))
const offerFrom = mock(() => ({ where: offerWhere }))

const listLimit = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const listOrderBy = mock(() => ({ limit: listLimit }))
const listWhere = mock(() => {
  const result = dbSelectResults[dbSelectCallIdx - 1] ?? []
  const p = Promise.resolve(result)
  return {
    orderBy: listOrderBy,
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  }
})
const listInnerJoin2 = mock(() => ({ where: listWhere }))
const listInnerJoin1 = mock(() => ({ innerJoin: listInnerJoin2 }))
const listFrom = mock(() => ({ innerJoin: listInnerJoin1, where: listWhere }))

const dbSelect = mock(() => {
  dbSelectCallIdx += 1

  if (shouldUseOfferLookupFirst && dbSelectCallIdx === 1) {
    return { from: offerFrom }
  }

  return { from: listFrom }
})

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
    execute: dbExecute,
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

describe("src/server/services/messages/list-threads-by-company", () => {
  beforeEach(() => {
    dbSelectResults.length = 0
    dbSelectCallIdx = 0
    shouldUseOfferLookupFirst = false
    dbExecuteRows = []

    dbSelect.mockClear()
    dbExecute.mockClear()
    offerFrom.mockClear()
    offerWhere.mockClear()
    offerLimit.mockClear()
    listFrom.mockClear()
    listInnerJoin1.mockClear()
    listInnerJoin2.mockClear()
    listWhere.mockClear()
    listOrderBy.mockClear()
    listLimit.mockClear()

    offerFrom.mockReturnValue({ where: offerWhere })
    offerWhere.mockReturnValue({ limit: offerLimit })

    listFrom.mockReturnValue({ innerJoin: listInnerJoin1, where: listWhere })
    listInnerJoin1.mockReturnValue({ innerJoin: listInnerJoin2 })
    listInnerJoin2.mockReturnValue({ where: listWhere })
    listOrderBy.mockReturnValue({ limit: listLimit })
  })

  test("should throw typed error when filtered offer does not exist", async () => {
    shouldUseOfferLookupFirst = true
    dbSelectResults.push([])

    const { listMessageThreadsByCompany } = await import(
      "@/server/services/messages/list-threads-by-company?fresh=1" as string
    )

    await expectMessageError(
      listMessageThreadsByCompany("company-1", "company-admin-1", {
        offerId: "offer-1",
      }),
      "OFFER_NOT_FOUND",
      "Offer not found",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(listLimit).not.toHaveBeenCalled()
  })

  test("should throw typed error when filtered offer belongs to another company", async () => {
    shouldUseOfferLookupFirst = true
    dbSelectResults.push([{ id: "offer-1", companyId: "company-2" }])

    const { listMessageThreadsByCompany } = await import(
      "@/server/services/messages/list-threads-by-company?fresh=2" as string
    )

    await expectMessageError(
      listMessageThreadsByCompany("company-1", "company-admin-1", {
        offerId: "offer-1",
      }),
      "OFFER_FORBIDDEN",
      "You do not have access to this offer",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(listLimit).not.toHaveBeenCalled()
  })

  test("should list company threads without offer filter using default limit", async () => {
    const rows = [
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-1",
        studentName: "Student One",
        studentImage: null,
        lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
      },
    ]
    dbSelectResults.push(rows)
    dbSelectResults.push([
      { threadId: "thread-1", lastReadMessageId: "message-1" },
    ])
    dbExecuteRows = [
      { id: "message-2", sender_user_id: "student-1", thread_id: "thread-1" },
    ]

    const { listMessageThreadsByCompany } = await import(
      "@/server/services/messages/list-threads-by-company?fresh=3" as string
    )

    const result = await listMessageThreadsByCompany(
      "company-1",
      "company-admin-1",
    )

    expect(result).toEqual([
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-1",
        studentName: "Student One",
        studentImage: null,
        lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        hasUnread: true,
        unreadCount: 1,
      },
    ])
    expect(dbSelect).toHaveBeenCalledTimes(2)
    expect(listLimit).toHaveBeenCalledWith(30)
  })

  test("should list filtered company threads with custom limit", async () => {
    shouldUseOfferLookupFirst = true
    const rows = [
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-1",
        studentName: "Student One",
        studentImage: null,
        lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
      },
      {
        id: "thread-2",
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-2",
        studentName: "Student Two",
        studentImage: "https://example.com/student-two.png",
        lastMessageAt: new Date("2030-01-03T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T01:00:00.000Z"),
      },
    ]
    dbSelectResults.push([{ id: "offer-1", companyId: "company-1" }])
    dbSelectResults.push(rows)
    dbSelectResults.push([
      { threadId: "thread-1", lastReadMessageId: "message-2" },
    ])
    dbExecuteRows = [
      {
        id: "message-2",
        sender_user_id: "student-1",
        thread_id: "thread-1",
      },
      {
        id: "message-3",
        sender_user_id: "company-admin-1",
        thread_id: "thread-2",
      },
    ]

    const { listMessageThreadsByCompany } = await import(
      "@/server/services/messages/list-threads-by-company?fresh=4" as string
    )

    const result = await listMessageThreadsByCompany(
      "company-1",
      "company-admin-1",
      {
        offerId: "offer-1",
        limit: 2,
      },
    )

    expect(result).toEqual([
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-1",
        studentName: "Student One",
        studentImage: null,
        lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        hasUnread: false,
        unreadCount: 0,
      },
      {
        id: "thread-2",
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-2",
        studentName: "Student Two",
        studentImage: "https://example.com/student-two.png",
        lastMessageAt: new Date("2030-01-03T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T01:00:00.000Z"),
        hasUnread: false,
        unreadCount: 0,
      },
    ])
    expect(dbSelect).toHaveBeenCalledTimes(3)
    expect(offerLimit).toHaveBeenCalledWith(1)
    expect(listLimit).toHaveBeenCalledWith(2)
  })
})
