import { beforeEach, describe, expect, mock, test } from "bun:test"

import {
  MessageServiceError,
  type MessageServiceErrorCode,
} from "@/server/services/messages/errors"

const dbSelectResults: unknown[][] = []
let dbSelectCallIdx = 0

const dbLimit = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const dbWhere = mock(() => ({
  limit: dbLimit,
  then: (resolve: (value: unknown[]) => void) =>
    resolve(dbSelectResults[dbSelectCallIdx - 1] ?? []),
}))
const dbFrom = mock(() => ({ where: dbWhere }))
const dbSelect = mock(() => {
  dbSelectCallIdx += 1
  return { from: dbFrom }
})

const txReturning = mock(() => Promise.resolve([{ id: "thread-1" }]))
const txOnConflictDoUpdate = mock(() => ({ returning: txReturning }))
const txValuesForThread = mock(() => ({
  onConflictDoUpdate: txOnConflictDoUpdate,
}))
const txValuesForMessage = mock(() => Promise.resolve())

let txInsertCallIdx = 0
const txInsert = mock(() => {
  txInsertCallIdx += 1
  if (txInsertCallIdx === 1) {
    return { values: txValuesForThread }
  }

  return { values: txValuesForMessage }
})

const tx = {
  insert: txInsert,
}

const mockTransaction = mock(
  async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx),
)

const createNotificationMock = mock(async () => ({ id: "notification-1" }))

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
    transaction: mockTransaction,
  },
}))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
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

describe("src/server/services/messages/send-by-student", () => {
  beforeEach(() => {
    dbSelectResults.length = 0
    dbSelectCallIdx = 0
    txInsertCallIdx = 0

    dbSelect.mockClear()
    dbFrom.mockClear()
    dbWhere.mockClear()
    dbLimit.mockClear()
    txInsert.mockClear()
    txValuesForThread.mockClear()
    txOnConflictDoUpdate.mockClear()
    txReturning.mockClear()
    txValuesForMessage.mockClear()
    mockTransaction.mockClear()
    createNotificationMock.mockClear()

    dbFrom.mockReturnValue({ where: dbWhere })
    dbWhere.mockImplementation(() => ({
      limit: dbLimit,
      then: (resolve: (value: unknown[]) => void) =>
        resolve(dbSelectResults[dbSelectCallIdx - 1] ?? []),
    }))

    txValuesForThread.mockReturnValue({
      onConflictDoUpdate: txOnConflictDoUpdate,
    })
    txOnConflictDoUpdate.mockReturnValue({ returning: txReturning })
    txReturning.mockResolvedValue([{ id: "thread-1" }])
    txValuesForMessage.mockResolvedValue(undefined)

    txInsert.mockImplementation(() => {
      txInsertCallIdx += 1
      if (txInsertCallIdx === 1) {
        return { values: txValuesForThread }
      }

      return { values: txValuesForMessage }
    })

    mockTransaction.mockImplementation(async (callback) => callback(tx))
  })

  test("should throw typed error when body is empty after trimming", async () => {
    const { sendOfferMessageByStudent } = await import(
      "@/server/services/messages/send-by-student?fresh=1" as string
    )

    await expectMessageError(
      sendOfferMessageByStudent(
        { offerId: "offer-1", body: "   " },
        "student-1",
      ),
      "MESSAGE_EMPTY",
      "Message body cannot be empty",
    )

    expect(dbSelect).not.toHaveBeenCalled()
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw typed error when offer does not exist", async () => {
    dbSelectResults.push([])

    const { sendOfferMessageByStudent } = await import(
      "@/server/services/messages/send-by-student?fresh=2" as string
    )

    await expectMessageError(
      sendOfferMessageByStudent(
        { offerId: "offer-1", body: "Hello" },
        "student-1",
      ),
      "OFFER_NOT_FOUND",
      "Offer not found",
    )

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw typed error when student has not applied to the offer", async () => {
    dbSelectResults.push([
      { id: "offer-1", companyId: "company-1", title: "Offer title" },
    ])
    dbSelectResults.push([])

    const { sendOfferMessageByStudent } = await import(
      "@/server/services/messages/send-by-student?fresh=3" as string
    )

    await expectMessageError(
      sendOfferMessageByStudent(
        { offerId: "offer-1", body: "Hello" },
        "student-1",
      ),
      "APPLICATION_NOT_FOUND",
      "You cannot message this company for the selected offer",
    )

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should create thread and message with trimmed body", async () => {
    dbSelectResults.push([
      { id: "offer-1", companyId: "company-1", title: "Offer title" },
    ])
    dbSelectResults.push([{ id: "application-1" }])
    dbSelectResults.push([
      { userId: "company-admin-1" },
      { userId: "company-admin-2" },
    ])

    const { sendOfferMessageByStudent } = await import(
      "@/server/services/messages/send-by-student?fresh=4" as string
    )

    const result = await sendOfferMessageByStudent(
      {
        offerId: "offer-1",
        body: "  Hello from student  ",
      },
      "student-1",
    )

    expect(result.threadId).toBe("thread-1")
    expect(typeof result.messageId).toBe("string")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(txInsert).toHaveBeenCalledTimes(2)
    expect(createNotificationMock).toHaveBeenCalledTimes(2)

    const threadValueCalls = txValuesForThread.mock
      .calls as unknown as unknown[][]
    const messageValueCalls = txValuesForMessage.mock
      .calls as unknown as unknown[][]

    const threadValues = threadValueCalls[0]?.[0] as {
      offerId: string
      companyId: string
      studentUserId: string
      createdByUserId: string
    }
    const messageValues = messageValueCalls[0]?.[0] as {
      offerId: string
      senderUserId: string
      body: string
    }

    expect(threadValues.offerId).toBe("offer-1")
    expect(threadValues.companyId).toBe("company-1")
    expect(threadValues.studentUserId).toBe("student-1")
    expect(threadValues.createdByUserId).toBe("student-1")

    expect(messageValues.offerId).toBe("offer-1")
    expect(messageValues.senderUserId).toBe("student-1")
    expect(messageValues.body).toBe("Hello from student")

    const notificationCalls = createNotificationMock.mock
      .calls as unknown as unknown[][]
    const notifiedUserIds = notificationCalls
      .map(
        (call) => (call[0] as { userId: string }).userId,
      )
      .sort((a, b) => a.localeCompare(b))

    expect(notifiedUserIds).toEqual(["company-admin-1", "company-admin-2"])

    const firstNotification = notificationCalls[0]?.[0] as {
      type: string
      payload: {
        offerId: string
        offerTitle: string
        threadId: string
        senderRole: string
        senderUserId: string
      }
    }

    expect(firstNotification.type).toBe("new_message")
    expect(firstNotification.payload.offerId).toBe("offer-1")
    expect(firstNotification.payload.offerTitle).toBe("Offer title")
    expect(firstNotification.payload.threadId).toBe("thread-1")
    expect(firstNotification.payload.senderRole).toBe("student")
    expect(firstNotification.payload.senderUserId).toBe("student-1")
  })
})
