import { beforeEach, describe, expect, mock, test } from "bun:test"

const dbSelectResults: unknown[][] = []
let dbSelectCallIdx = 0

const dbLimit = mock(() => {
  const results = dbSelectResults[dbSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const dbWhere = mock(() => ({ limit: dbLimit }))
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

describe("src/server/services/messages/send-by-company", () => {
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
    dbWhere.mockReturnValue({ limit: dbLimit })

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

  test("should throw when body is empty after trimming", async () => {
    const { sendOfferMessageByCompany } = await import(
      "@/server/services/messages/send-by-company?fresh=1" as string
    )

    await expect(
      sendOfferMessageByCompany(
        { offerId: "offer-1", studentUserId: "student-1", body: "   " },
        "company-1",
        "sender-1",
      ),
    ).rejects.toThrow("Message body cannot be empty")

    expect(dbSelect).not.toHaveBeenCalled()
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when offer does not exist", async () => {
    dbSelectResults.push([])

    const { sendOfferMessageByCompany } = await import(
      "@/server/services/messages/send-by-company?fresh=2" as string
    )

    await expect(
      sendOfferMessageByCompany(
        { offerId: "offer-1", studentUserId: "student-1", body: "Hello" },
        "company-1",
        "sender-1",
      ),
    ).rejects.toThrow("Offer not found")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when company does not own the offer", async () => {
    dbSelectResults.push([{ id: "offer-1", companyId: "company-2" }])

    const { sendOfferMessageByCompany } = await import(
      "@/server/services/messages/send-by-company?fresh=3" as string
    )

    await expect(
      sendOfferMessageByCompany(
        { offerId: "offer-1", studentUserId: "student-1", body: "Hello" },
        "company-1",
        "sender-1",
      ),
    ).rejects.toThrow("You do not have access to this offer")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when student has no application for offer", async () => {
    dbSelectResults.push([{ id: "offer-1", companyId: "company-1" }])
    dbSelectResults.push([])

    const { sendOfferMessageByCompany } = await import(
      "@/server/services/messages/send-by-company?fresh=4" as string
    )

    await expect(
      sendOfferMessageByCompany(
        { offerId: "offer-1", studentUserId: "student-1", body: "Hello" },
        "company-1",
        "sender-1",
      ),
    ).rejects.toThrow("Student has not applied to this offer")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should create thread and message with trimmed body", async () => {
    dbSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Platform Engineer Intern",
      },
    ])
    dbSelectResults.push([{ id: "application-1" }])

    const { sendOfferMessageByCompany } = await import(
      "@/server/services/messages/send-by-company?fresh=5" as string
    )

    const result = await sendOfferMessageByCompany(
      {
        offerId: "offer-1",
        studentUserId: "student-1",
        body: "  Hello from company  ",
      },
      "company-1",
      "sender-1",
    )

    expect(result.threadId).toBe("thread-1")
    expect(typeof result.messageId).toBe("string")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(txInsert).toHaveBeenCalledTimes(2)
    expect(createNotificationMock).toHaveBeenCalledTimes(1)

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
    expect(threadValues.createdByUserId).toBe("sender-1")

    expect(messageValues.offerId).toBe("offer-1")
    expect(messageValues.senderUserId).toBe("sender-1")
    expect(messageValues.body).toBe("Hello from company")

    const notificationCalls = createNotificationMock.mock
      .calls as unknown as unknown[][]
    const notificationCallRaw = notificationCalls[0]?.[0]
    expect(notificationCallRaw).toBeDefined()

    const notificationCall = notificationCallRaw as unknown as {
      userId: string
      type: string
      payload: {
        offerId: string
        offerTitle: string
        threadId: string
        messageId: string
        senderRole: string
        senderUserId: string
      }
    }

    expect(notificationCall.userId).toBe("student-1")
    expect(notificationCall.type).toBe("new_message")
    expect(notificationCall.payload.offerId).toBe("offer-1")
    expect(notificationCall.payload.offerTitle).toBe("Platform Engineer Intern")
    expect(notificationCall.payload.threadId).toBe("thread-1")
    expect(notificationCall.payload.messageId).toBe(result.messageId)
    expect(notificationCall.payload.senderRole).toBe("company")
    expect(notificationCall.payload.senderUserId).toBe("sender-1")
  })
})
