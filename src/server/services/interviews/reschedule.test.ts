import { beforeEach, describe, expect, mock, test } from "bun:test"

const txSelectResults: unknown[][] = []
let txSelectCallIdx = 0

const txLimit = mock(() => {
  const results = txSelectResults[txSelectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const txForUpdate = mock(() => ({ limit: txLimit }))
const txWhereWithLock = mock(() => ({ for: txForUpdate }))
const _txWhere = mock(() => ({ limit: txLimit }))
const txFromWithLock = mock(() => ({ where: txWhereWithLock }))

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
    return { from: txFromWithLock }
  }),
  delete: txDelete,
  insert: txInsert,
  update: txUpdate,
}

const mockTransaction = mock(
  async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx),
)

mock.module("@/server/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}))

const createNotificationMock = mock(async () => ({ id: "notification-1" }))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))

describe("src/server/services/interviews/reschedule", () => {
  beforeEach(() => {
    txSelectResults.length = 0
    txSelectCallIdx = 0

    txLimit.mockClear()
    txForUpdate.mockClear()
    txWhereWithLock.mockClear()
    txFromWithLock.mockClear()
    txDelete.mockClear()
    txDeleteWhere.mockClear()
    txInsert.mockClear()
    txInsertValues.mockClear()
    txUpdate.mockClear()
    txUpdateSet.mockClear()
    txUpdateWhere.mockClear()
    mockTransaction.mockClear()
    createNotificationMock.mockClear()

    txFromWithLock.mockReturnValue({ where: txWhereWithLock })
    txWhereWithLock.mockReturnValue({ for: txForUpdate })
    txForUpdate.mockReturnValue({ limit: txLimit })

    txDelete.mockReturnValue({ where: txDeleteWhere })
    txDeleteWhere.mockResolvedValue(undefined)

    txInsert.mockReturnValue({ values: txInsertValues })
    txInsertValues.mockResolvedValue(undefined)

    txUpdate.mockReturnValue({ set: txUpdateSet })
    txUpdateSet.mockReturnValue({ where: txUpdateWhere })
    txUpdateWhere.mockResolvedValue(undefined)

    mockTransaction.mockImplementation(async (callback) => callback(tx))
  })

  test("should throw when no slots are provided", async () => {
    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=1" as string
    )

    await expect(
      rescheduleInterviewSlots(
        { interviewId: "interview-1", slots: [] },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("At least one slot must be proposed")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when a slot starts after it ends", async () => {
    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=2" as string
    )

    await expect(
      rescheduleInterviewSlots(
        {
          interviewId: "interview-1",
          slots: [
            {
              startsAt: new Date("2030-04-10T11:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("Each slot start time must be before end time")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when a slot is in the past", async () => {
    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=3" as string
    )

    await expect(
      rescheduleInterviewSlots(
        {
          interviewId: "interview-1",
          slots: [
            {
              startsAt: new Date("2000-04-10T09:00:00.000Z"),
              endsAt: new Date("2000-04-10T10:00:00.000Z"),
            },
          ],
        },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("Interview slots must be scheduled in the future")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when interview is not found", async () => {
    txSelectResults.push([])

    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=4" as string
    )

    await expect(
      rescheduleInterviewSlots(
        {
          interviewId: "interview-1",
          slots: [
            {
              startsAt: new Date("2030-04-10T09:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("Interview not found")

    expect(txDelete).not.toHaveBeenCalled()
  })

  test("should throw when company does not own the interview", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        companyId: "company-2",
        studentUserId: "student-1",
        offerId: "offer-1",
        status: "pending_confirmation",
        note: null,
      },
    ])

    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=5" as string
    )

    await expect(
      rescheduleInterviewSlots(
        {
          interviewId: "interview-1",
          slots: [
            {
              startsAt: new Date("2030-04-10T09:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("You do not have access to this interview")

    expect(txDelete).not.toHaveBeenCalled()
  })

  test("should throw when interview is completed", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        companyId: "company-1",
        studentUserId: "student-1",
        offerId: "offer-1",
        status: "completed",
        note: null,
      },
    ])

    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=6" as string
    )

    await expect(
      rescheduleInterviewSlots(
        {
          interviewId: "interview-1",
          slots: [
            {
              startsAt: new Date("2030-04-10T09:00:00.000Z"),
              endsAt: new Date("2030-04-10T10:00:00.000Z"),
            },
          ],
        },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("Completed interviews cannot be rescheduled")

    expect(txDelete).not.toHaveBeenCalled()
  })

  test("should reschedule, replace slots, reset state, and notify student", async () => {
    const startsAt = new Date("2030-04-20T09:00:00.000Z")
    const endsAt = new Date("2030-04-20T10:00:00.000Z")

    txSelectResults.push([
      {
        id: "interview-1",
        companyId: "company-1",
        studentUserId: "student-1",
        offerId: "offer-1",
        status: "reschedule_requested",
        note: "Original note",
      },
    ])

    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=7" as string
    )

    const result = await rescheduleInterviewSlots(
      {
        interviewId: "interview-1",
        note: "New proposed slots",
        slots: [
          {
            startsAt,
            endsAt,
            location: "  Conference Room B  ",
            meetingUrl: " https://meet.example.com/new ",
          },
        ],
      },
      "company-1",
      "actor-1",
    )

    expect(result.interviewId).toBe("interview-1")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(txDelete).toHaveBeenCalledTimes(1)
    expect(txInsert).toHaveBeenCalledTimes(1)
    expect(txUpdate).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).toHaveBeenCalledTimes(1)

    const txInsertValueCalls = txInsertValues.mock
      .calls as unknown as unknown[][]
    const slotInsertPayload = txInsertValueCalls[0]?.[0] as Array<{
      id: string
      interviewId: string
      startsAt: Date
      endsAt: Date
      location: string
      meetingUrl: string
    }>

    expect(slotInsertPayload).toHaveLength(1)
    expect(slotInsertPayload[0]).toMatchObject({
      interviewId: "interview-1",
      startsAt,
      endsAt,
      location: "Conference Room B",
      meetingUrl: "https://meet.example.com/new",
    })

    const txUpdateSetCalls = txUpdateSet.mock.calls as unknown as unknown[][]
    const updatePayload = txUpdateSetCalls[0]?.[0] as {
      status: string
      confirmedSlotId: null
      confirmedByUserId: null
      confirmedAt: null
      rescheduleNote: null
      rescheduleRequestedAt: null
      rescheduleRequestedByUserId: null
      note: string
    }

    expect(updatePayload.status).toBe("pending_confirmation")
    expect(updatePayload.confirmedSlotId).toBeNull()
    expect(updatePayload.confirmedByUserId).toBeNull()
    expect(updatePayload.confirmedAt).toBeNull()
    expect(updatePayload.rescheduleNote).toBeNull()
    expect(updatePayload.rescheduleRequestedAt).toBeNull()
    expect(updatePayload.rescheduleRequestedByUserId).toBeNull()
    expect(updatePayload.note).toBe("New proposed slots")

    const notificationCalls = createNotificationMock.mock
      .calls as unknown as unknown[][]
    const notificationCall = notificationCalls[0]?.[0] as {
      userId: string
      type: string
      payload: { interviewId: string; offerId: string }
    }

    expect(notificationCall.userId).toBe("student-1")
    expect(notificationCall.type).toBe("interview_rescheduled")
    expect(notificationCall.payload.interviewId).toBe("interview-1")
    expect(notificationCall.payload.offerId).toBe("offer-1")
  })

  test("should keep existing note when new note is not provided", async () => {
    txSelectResults.push([
      {
        id: "interview-1",
        companyId: "company-1",
        studentUserId: "student-1",
        offerId: "offer-1",
        status: "confirmed",
        note: "Existing note",
      },
    ])

    const { rescheduleInterviewSlots } = await import(
      "@/server/services/interviews/reschedule?fresh=8" as string
    )

    await rescheduleInterviewSlots(
      {
        interviewId: "interview-1",
        slots: [
          {
            startsAt: new Date("2030-04-20T09:00:00.000Z"),
            endsAt: new Date("2030-04-20T10:00:00.000Z"),
          },
        ],
      },
      "company-1",
      "actor-1",
    )

    const txUpdateSetCalls = txUpdateSet.mock.calls as unknown as unknown[][]
    const updatePayload = txUpdateSetCalls[0]?.[0] as { note: string }

    expect(updatePayload.note).toBe("Existing note")
  })
})
