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

const mockTransaction = mock(async (callback: (trx: typeof tx) => Promise<unknown>) =>
  callback(tx),
)

mock.module("@/server/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}))

describe("src/server/services/interviews/confirm", () => {
  beforeEach(() => {
    txSelectResults.length = 0
    txSelectCallIdx = 0

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

    txFromWithLock.mockReturnValue({ where: txWhereWithLock })
    txWhereWithLock.mockReturnValue({ for: txForUpdate })
    txForUpdate.mockReturnValue({ limit: txLimit })
    txFrom.mockReturnValue({ where: txWhere })
    txWhere.mockReturnValue({ limit: txLimit })

    txUpdate.mockReturnValue({ set: txUpdateSet })
    txUpdateSet.mockReturnValue({ where: txUpdateWhere })
    txUpdateWhere.mockResolvedValue(undefined)

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

    const txUpdateSetCalls = txUpdateSet.mock.calls as unknown as unknown[][]
    const updatePayload = txUpdateSetCalls[0]?.[0] as {
      status: string
      confirmedSlotId: string
      confirmedByUserId: string
    }

    expect(updatePayload.status).toBe("confirmed")
    expect(updatePayload.confirmedSlotId).toBe("slot-1")
    expect(updatePayload.confirmedByUserId).toBe("student-1")
  })
})
