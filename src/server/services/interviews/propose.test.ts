import { beforeEach, describe, expect, mock, test } from "bun:test"

const txSelectResults: unknown[][] = []
let txSelectCallIdx = 0

function getCurrentSelectResults() {
  return txSelectResults[txSelectCallIdx - 1] ?? []
}

const txLimit = mock(() => Promise.resolve(getCurrentSelectResults()))
const txForUpdate = mock(() => ({ limit: txLimit }))
const txWhereWithLock = mock(() => ({ for: txForUpdate }))
const txJoinApplication = mock(() => ({ where: txWhereWithLock }))
const txFromApplication = mock(() => ({ innerJoin: txJoinApplication }))

const txWhere = mock(() => ({ limit: txLimit }))
const txFrom = mock(() => ({ where: txWhere }))

const txInsertValues = mock(() => Promise.resolve())
const txInsert = mock(() => ({ values: txInsertValues }))

const txSelect = mock(() => {
  txSelectCallIdx += 1

  if (txSelectCallIdx === 1) {
    return { from: txFromApplication }
  }

  return { from: txFrom }
})

const tx = {
  select: txSelect,
  insert: txInsert,
}

const mockTransaction = mock(
  async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx),
)

mock.module("@/server/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}))

describe("src/server/services/interviews/propose", () => {
  beforeEach(() => {
    txSelectResults.length = 0
    txSelectCallIdx = 0

    txLimit.mockClear()
    txForUpdate.mockClear()
    txWhereWithLock.mockClear()
    txJoinApplication.mockClear()
    txFromApplication.mockClear()
    txWhere.mockClear()
    txFrom.mockClear()
    txInsertValues.mockClear()
    txInsert.mockClear()
    txSelect.mockClear()
    mockTransaction.mockClear()

    txFromApplication.mockReturnValue({ innerJoin: txJoinApplication })
    txJoinApplication.mockReturnValue({ where: txWhereWithLock })
    txWhereWithLock.mockReturnValue({ for: txForUpdate })
    txForUpdate.mockReturnValue({ limit: txLimit })

    txFrom.mockReturnValue({ where: txWhere })
    txWhere.mockReturnValue({ limit: txLimit })

    txInsert.mockReturnValue({ values: txInsertValues })
    txInsertValues.mockResolvedValue(undefined)

    mockTransaction.mockImplementation(async (callback) => callback(tx))
  })

  test("should throw when no slots are provided", async () => {
    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=1" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
          slots: [],
        },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("At least one slot must be proposed")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when a slot starts after it ends", async () => {
    const startsAt = new Date("2030-04-10T11:00:00.000Z")
    const endsAt = new Date("2030-04-10T10:00:00.000Z")

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=2" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
          slots: [{ startsAt, endsAt }],
        },
        "company-1",
        "actor-1",
      ),
    ).rejects.toThrow("Each slot start time must be before end time")

    expect(mockTransaction).not.toHaveBeenCalled()
  })

  test("should throw when application is not found", async () => {
    txSelectResults.push([])

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=3" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
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
    ).rejects.toThrow("Application not found")

    expect(txInsert).not.toHaveBeenCalled()
  })

  test("should throw when application belongs to another company", async () => {
    txSelectResults.push([
      {
        id: "application-1",
        status: "applied",
        pipelineStage: "applied",
        offerId: "offer-1",
        studentUserId: "student-1",
        companyId: "company-2",
      },
    ])

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=4" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
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
    ).rejects.toThrow("You do not have access to this application")
  })

  test("should throw when application is already company accepted", async () => {
    txSelectResults.push([
      {
        id: "application-1",
        status: "company_accepted",
        pipelineStage: "offer",
        offerId: "offer-1",
        studentUserId: "student-1",
        companyId: "company-1",
      },
    ])

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=5" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
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
    ).rejects.toThrow(
      "Interview cannot be proposed for this application status",
    )
  })

  test("should throw when application is already admin validated", async () => {
    txSelectResults.push([
      {
        id: "application-1",
        status: "admin_validated",
        pipelineStage: "accepted",
        offerId: "offer-1",
        studentUserId: "student-1",
        companyId: "company-1",
      },
    ])

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=6" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
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
    ).rejects.toThrow(
      "Interview cannot be proposed for this application status",
    )
  })

  test("should throw when application is already in offer stage", async () => {
    txSelectResults.push([
      {
        id: "application-1",
        status: "applied",
        pipelineStage: "offer",
        offerId: "offer-1",
        studentUserId: "student-1",
        companyId: "company-1",
      },
    ])

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=7" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
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
    ).rejects.toThrow(
      "Interview can only be proposed while the application is in an interview pipeline stage",
    )
  })

  test("should throw when interview already exists for the application", async () => {
    txSelectResults.push([
      {
        id: "application-1",
        status: "applied",
        pipelineStage: "interview",
        offerId: "offer-1",
        studentUserId: "student-1",
        companyId: "company-1",
      },
    ])
    txSelectResults.push([{ id: "interview-1" }])

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=8" as string
    )

    await expect(
      proposeInterviewSlots(
        {
          applicationId: "application-1",
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
    ).rejects.toThrow("Interview already exists for this application")

    expect(txInsert).not.toHaveBeenCalled()
  })

  test("should create interview and trim note and slot metadata", async () => {
    const startsAt1 = new Date("2030-04-10T09:00:00.000Z")
    const endsAt1 = new Date("2030-04-10T10:00:00.000Z")
    const startsAt2 = new Date("2030-04-11T11:00:00.000Z")
    const endsAt2 = new Date("2030-04-11T12:00:00.000Z")

    txSelectResults.push([
      {
        id: "application-1",
        status: "applied",
        pipelineStage: "interview",
        offerId: "offer-1",
        studentUserId: "student-1",
        companyId: "company-1",
      },
    ])
    txSelectResults.push([])

    const { proposeInterviewSlots } = await import(
      "@/server/services/interviews/propose?fresh=9" as string
    )

    const result = await proposeInterviewSlots(
      {
        applicationId: "application-1",
        note: "  Please confirm one of these slots  ",
        slots: [
          {
            startsAt: startsAt1,
            endsAt: endsAt1,
            location: "  HQ Room A  ",
            meetingUrl: " https://meet.example.com/abc ",
          },
          {
            startsAt: startsAt2,
            endsAt: endsAt2,
            location: "   ",
            meetingUrl: "",
          },
        ],
      },
      "company-1",
      "actor-1",
    )

    expect(result.studentUserId).toBe("student-1")
    expect(typeof result.interviewId).toBe("string")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(txSelect).toHaveBeenCalledTimes(2)
    expect(txInsert).toHaveBeenCalledTimes(2)

    const txInsertValueCalls = txInsertValues.mock
      .calls as unknown as unknown[][]

    const interviewInsertPayload = txInsertValueCalls[0]?.[0] as {
      id: string
      applicationId: string
      offerId: string
      companyId: string
      studentUserId: string
      proposedByUserId: string
      status: string
      note: string | null
    }

    expect(interviewInsertPayload).toMatchObject({
      applicationId: "application-1",
      offerId: "offer-1",
      companyId: "company-1",
      studentUserId: "student-1",
      proposedByUserId: "actor-1",
      status: "pending_confirmation",
      note: "Please confirm one of these slots",
    })
    expect(typeof interviewInsertPayload.id).toBe("string")

    const slotInsertPayload = txInsertValueCalls[1]?.[0] as Array<{
      id: string
      interviewId: string
      startsAt: Date
      endsAt: Date
      location: string | null
      meetingUrl: string | null
    }>

    expect(slotInsertPayload).toHaveLength(2)
    expect(slotInsertPayload[0]).toMatchObject({
      interviewId: result.interviewId,
      startsAt: startsAt1,
      endsAt: endsAt1,
      location: "HQ Room A",
      meetingUrl: "https://meet.example.com/abc",
    })
    expect(typeof slotInsertPayload[0]?.id).toBe("string")
    expect(slotInsertPayload[1]).toMatchObject({
      interviewId: result.interviewId,
      startsAt: startsAt2,
      endsAt: endsAt2,
      location: null,
      meetingUrl: null,
    })
    expect(typeof slotInsertPayload[1]?.id).toBe("string")
  })
})
