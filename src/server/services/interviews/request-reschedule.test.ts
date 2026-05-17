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

const txDeleteWhere = mock(() => Promise.resolve())
const txDelete = mock(() => ({ where: txDeleteWhere }))

const txInsertValues = mock(() => Promise.resolve())
const txInsert = mock(() => ({ values: txInsertValues }))

const txUpdateWhere = mock(() => Promise.resolve())
const txUpdateSet = mock(() => ({ where: txUpdateWhere }))
const txUpdate = mock(() => ({ set: txUpdateSet }))

const tx = {
  select: mock(() => {
    txSelectCallIdx += 1
    if (txSelectCallIdx === 1) {
      return { from: txFromWithLock }
    }
    return { from: txFrom }
  }),
  delete: txDelete,
  insert: txInsert,
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

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
    transaction: mockTransaction,
  },
}))

const createNotificationMock = mock(async () => ({ id: "notification-1" }))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))

describe("src/server/services/interviews/request-reschedule", () => {
  beforeEach(() => {
    txSelectResults.length = 0
    txSelectCallIdx = 0
    dbSelectResults.length = 0
    dbSelectCallIdx = 0

    txLimit.mockClear()
    txForUpdate.mockClear()
    txWhereWithLock.mockClear()
    txWhere.mockClear()
    txFromWithLock.mockClear()
    txFrom.mockClear()
    txDelete.mockClear()
    txDeleteWhere.mockClear()
    txInsert.mockClear()
    txInsertValues.mockClear()
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

    txDelete.mockReturnValue({ where: txDeleteWhere })
    txDeleteWhere.mockResolvedValue(undefined)

    txInsert.mockReturnValue({ values: txInsertValues })
    txInsertValues.mockResolvedValue(undefined)

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

  test("should throw when no proposed slots are provided", async () => {
    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=1" as string
    )

    await expect(
      requestInterviewReschedule(
        { interviewId: "interview-1", proposedSlots: [] },
        "student-1",
      ),
    ).rejects.toThrow("At least one proposed slot is required")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when a slot starts after it ends", async () => {
    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=2" as string
    )

    await expect(
      requestInterviewReschedule(
        {
          interviewId: "interview-1",
          proposedSlots: [
            {
              startsAt: new Date("2030-04-10T11:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "student-1",
      ),
    ).rejects.toThrow("Each slot start time must be before end time")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when a proposed slot is in the past", async () => {
    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=3" as string
    )

    await expect(
      requestInterviewReschedule(
        {
          interviewId: "interview-1",
          proposedSlots: [
            {
              startsAt: new Date("2000-04-10T09:00:00.000Z"),
              endsAt: new Date("2000-04-10T10:00:00.000Z"),
            },
          ],
        },
        "student-1",
      ),
    ).rejects.toThrow("Proposed slots must be in the future")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when interview is not found", async () => {
    txSelectResults.push([])

    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=4" as string
    )

    await expect(
      requestInterviewReschedule(
        {
          interviewId: "interview-1",
          proposedSlots: [
            {
              startsAt: new Date("2030-04-10T09:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "student-1",
      ),
    ).rejects.toThrow("Interview not found")

    expect(txDelete).not.toHaveBeenCalled()
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

    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=5" as string
    )

    await expect(
      requestInterviewReschedule(
        {
          interviewId: "interview-1",
          proposedSlots: [
            {
              startsAt: new Date("2030-04-10T09:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "student-1",
      ),
    ).rejects.toThrow("You do not have access to this interview")

    expect(txDelete).not.toHaveBeenCalled()
  })

  test("should throw when interview is cancelled", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        studentUserId: "student-1",
        companyId: "company-1",
        offerId: "offer-1",
        status: "cancelled",
      },
    ])

    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=6" as string
    )

    await expect(
      requestInterviewReschedule(
        {
          interviewId: "interview-1",
          proposedSlots: [
            {
              startsAt: new Date("2030-04-10T09:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "student-1",
      ),
    ).rejects.toThrow("Interview cannot be rescheduled in its current state")

    expect(txDelete).not.toHaveBeenCalled()
  })

  test("should throw when interview is completed", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        studentUserId: "student-1",
        companyId: "company-1",
        offerId: "offer-1",
        status: "completed",
      },
    ])

    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=7" as string
    )

    await expect(
      requestInterviewReschedule(
        {
          interviewId: "interview-1",
          proposedSlots: [
            {
              startsAt: new Date("2030-04-10T09:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "student-1",
      ),
    ).rejects.toThrow("Interview cannot be rescheduled in its current state")

    expect(txDelete).not.toHaveBeenCalled()
  })

  test("should request reschedule, replace slots, and notify company", async () => {
    const startsAt = new Date("2030-04-15T09:00:00.000Z")
    const endsAt = new Date("2030-04-15T10:00:00.000Z")

    txSelectResults.push([
      {
        id: "interview-1",
        studentUserId: "student-1",
        companyId: "company-1",
        offerId: "offer-1",
        status: "confirmed",
      },
    ])

    dbSelectResults.push([
      { userId: "company-admin-1" },
      { userId: "company-admin-2" },
    ])

    const { requestInterviewReschedule } = await import(
      "@/server/services/interviews/request-reschedule?fresh=8" as string
    )

    const result = await requestInterviewReschedule(
      {
        interviewId: "interview-1",
        reason: "I have an exam that day",
        proposedSlots: [{ startsAt, endsAt }],
      },
      "student-1",
    )

    expect(result.interviewId).toBe("interview-1")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(txDelete).toHaveBeenCalledTimes(1)
    expect(txInsert).toHaveBeenCalledTimes(1)
    expect(txUpdate).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).toHaveBeenCalledTimes(2)

    const txInsertValueCalls = txInsertValues.mock.calls as unknown as unknown[][]
    const slotInsertPayload = txInsertValueCalls[0]?.[0] as Array<{
      id: string
      interviewId: string
      startsAt: Date
      endsAt: Date
      location: null
      meetingUrl: null
    }>

    expect(slotInsertPayload).toHaveLength(1)
    expect(slotInsertPayload[0]).toMatchObject({
      interviewId: "interview-1",
      startsAt,
      endsAt,
      location: null,
      meetingUrl: null,
    })

    const txUpdateSetCalls = txUpdateSet.mock.calls as unknown as unknown[][]
    const updatePayload = txUpdateSetCalls[0]?.[0] as {
      status: string
      confirmedSlotId: null
      confirmedByUserId: null
      confirmedAt: null
      rescheduleNote: string
      rescheduleRequestedByUserId: string
    }

    expect(updatePayload.status).toBe("reschedule_requested")
    expect(updatePayload.confirmedSlotId).toBeNull()
    expect(updatePayload.confirmedByUserId).toBeNull()
    expect(updatePayload.confirmedAt).toBeNull()
    expect(updatePayload.rescheduleNote).toBe("I have an exam that day")
    expect(updatePayload.rescheduleRequestedByUserId).toBe("student-1")

    const notificationCalls = createNotificationMock.mock
      .calls as unknown as unknown[][]
    const notifiedUserIds = notificationCalls
      .map((call) => (call[0] as { userId: string }).userId)
      .sort((a, b) => a.localeCompare(b))

    expect(notifiedUserIds).toEqual(["company-admin-1", "company-admin-2"])
  })
})
