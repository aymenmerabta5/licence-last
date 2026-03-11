import { beforeEach, describe, expect, mock, test } from "bun:test"

const txSelectResults: unknown[][] = []
let txSelectCallIdx = 0

const txLimit = mock(() => {
  const results = txSelectResults[txSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const txForUpdate = mock(() => ({ limit: txLimit }))
const txWhereWithLock = mock(() => ({ for: txForUpdate }))
const txWhere = mock(() => ({ limit: txLimit }))
const txFromWithLock = mock(() => ({ where: txWhereWithLock }))
const txFrom = mock(() => ({ where: txWhere }))

const txUpdateWhere = mock(() => Promise.resolve())
const txUpdateSet = mock(() => ({ where: txUpdateWhere }))
const txUpdate = mock(() => ({ set: txUpdateSet }))

const txSelect = mock(() => {
  txSelectCallIdx += 1
  if (txSelectCallIdx === 1) {
    return { from: txFromWithLock }
  }

  return { from: txFrom }
})

const tx = {
  select: txSelect,
  update: txUpdate,
}

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

describe("src/server/services/interviews/confirm", () => {
  beforeEach(() => {
    txSelectResults.length = 0
    txSelectCallIdx = 0
    dbSelectResults.length = 0
    dbSelectCallIdx = 0

    txSelect.mockClear()
    txFromWithLock.mockClear()
    txWhereWithLock.mockClear()
    txForUpdate.mockClear()
    txFrom.mockClear()
    txWhere.mockClear()
    txLimit.mockClear()
    txUpdate.mockClear()
    txUpdateSet.mockClear()
    txUpdateWhere.mockClear()
    mockTransaction.mockClear()
    dbSelect.mockClear()
    dbFrom.mockClear()
    dbWhere.mockClear()
    dbLimit.mockClear()
    createNotificationMock.mockClear()

    txFromWithLock.mockReturnValue({ where: txWhereWithLock })
    txWhereWithLock.mockReturnValue({ for: txForUpdate })
    txForUpdate.mockReturnValue({ limit: txLimit })
    txFrom.mockReturnValue({ where: txWhere })
    txWhere.mockReturnValue({ limit: txLimit })

    txUpdate.mockReturnValue({ set: txUpdateSet })
    txUpdateSet.mockReturnValue({ where: txUpdateWhere })
    txUpdateWhere.mockResolvedValue(undefined)

    dbFrom.mockReturnValue({ where: dbWhere })
    dbWhere.mockImplementation(() => ({
      limit: dbLimit,
      then: (resolve: (value: unknown[]) => void) =>
        resolve(dbSelectResults[dbSelectCallIdx - 1] ?? []),
    }))

    mockTransaction.mockImplementation(async (callback) => callback(tx))
  })

  test("should throw when interview is not found", async () => {
    txSelectResults.push([])

    const { confirmInterviewSlot } = await import(
      "@/server/services/interviews/confirm?fresh=1" as string
    )

    await expect(
      confirmInterviewSlot("interview-1", "slot-1", "student-1"),
    ).rejects.toThrow("Interview not found")

    expect(txUpdate).not.toHaveBeenCalled()
  })

  test("should throw when student cannot access the interview", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        studentUserId: "student-2",
        companyId: "company-1",
        offerId: "offer-1",
        status: "pending_confirmation",
      },
    ])

    const { confirmInterviewSlot } = await import(
      "@/server/services/interviews/confirm?fresh=2" as string
    )

    await expect(
      confirmInterviewSlot("interview-1", "slot-1", "student-1"),
    ).rejects.toThrow("You do not have access to this interview")
  })

  test("should throw when interview is already confirmed", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        studentUserId: "student-1",
        companyId: "company-1",
        offerId: "offer-1",
        status: "confirmed",
      },
    ])

    const { confirmInterviewSlot } = await import(
      "@/server/services/interviews/confirm?fresh=3" as string
    )

    await expect(
      confirmInterviewSlot("interview-1", "slot-1", "student-1"),
    ).rejects.toThrow("Interview is already confirmed")
  })

  test("should throw when slot does not exist for interview", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        studentUserId: "student-1",
        companyId: "company-1",
        offerId: "offer-1",
        status: "pending_confirmation",
      },
    ])
    txSelectResults.push([])

    const { confirmInterviewSlot } = await import(
      "@/server/services/interviews/confirm?fresh=4" as string
    )

    await expect(
      confirmInterviewSlot("interview-1", "slot-1", "student-1"),
    ).rejects.toThrow("Interview slot not found")

    expect(txUpdate).not.toHaveBeenCalled()
  })

  test("should confirm selected slot and return schedule", async () => {
    const startsAt = new Date("2030-04-10T09:00:00.000Z")
    const endsAt = new Date("2030-04-10T10:00:00.000Z")

    txSelectResults.push([
      {
        id: "interview-1",
        studentUserId: "student-1",
        companyId: "company-1",
        offerId: "offer-1",
        status: "pending_confirmation",
      },
    ])
    txSelectResults.push([
      {
        id: "slot-1",
        startsAt,
        endsAt,
      },
    ])
    dbSelectResults.push([
      { userId: "company-admin-1" },
      { userId: "company-admin-2" },
    ])

    const { confirmInterviewSlot } = await import(
      "@/server/services/interviews/confirm?fresh=5" as string
    )

    const result = await confirmInterviewSlot(
      "interview-1",
      "slot-1",
      "student-1",
    )

    expect(result).toEqual({
      interviewId: "interview-1",
      confirmedSlotId: "slot-1",
      startsAt,
      endsAt,
    })
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(txSelect).toHaveBeenCalledTimes(2)
    expect(txUpdate).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).toHaveBeenCalledTimes(2)

    const txUpdateSetCalls = txUpdateSet.mock.calls as unknown as unknown[][]
    const updatePayload = txUpdateSetCalls[0]?.[0] as {
      status: string
      confirmedSlotId: string
      confirmedByUserId: string
    }

    expect(updatePayload.status).toBe("confirmed")
    expect(updatePayload.confirmedSlotId).toBe("slot-1")
    expect(updatePayload.confirmedByUserId).toBe("student-1")

    const notificationCalls = createNotificationMock.mock
      .calls as unknown as unknown[][]
    const notifiedUserIds = notificationCalls
      .map((call) => (call[0] as { userId: string }).userId)
      .sort((a, b) => a.localeCompare(b))

    expect(notifiedUserIds).toEqual(["company-admin-1", "company-admin-2"])

    const firstNotification = notificationCalls[0]?.[0] as {
      type: string
      payload: {
        interviewId: string
        slotId: string
        offerId: string
        studentUserId: string
      }
    }

    expect(firstNotification.type).toBe("interview_confirmed")
    expect(firstNotification.payload.interviewId).toBe("interview-1")
    expect(firstNotification.payload.slotId).toBe("slot-1")
    expect(firstNotification.payload.offerId).toBe("offer-1")
    expect(firstNotification.payload.studentUserId).toBe("student-1")
  })
})
