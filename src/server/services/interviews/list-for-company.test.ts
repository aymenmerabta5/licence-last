import { beforeEach, describe, expect, mock, test } from "bun:test"

const dbSelectResults: unknown[][] = []
let dbSelectCallIdx = 0

function getCurrentSelectResults() {
  return dbSelectResults[dbSelectCallIdx - 1] ?? []
}

const interviewsLimit = mock(() => Promise.resolve(getCurrentSelectResults()))
const interviewsOrderBy = mock(() => ({ limit: interviewsLimit }))
const interviewsWhere = mock(() => ({ orderBy: interviewsOrderBy }))
const interviewsJoinOffers = mock(() => ({ where: interviewsWhere }))
const interviewsJoinUsers = mock(() => ({ innerJoin: interviewsJoinOffers }))
const interviewsFrom = mock(() => ({ innerJoin: interviewsJoinUsers }))

const slotsOrderBy = mock(() => Promise.resolve(getCurrentSelectResults()))
const slotsWhere = mock(() => ({ orderBy: slotsOrderBy }))
const slotsFrom = mock(() => ({ where: slotsWhere }))

const dbSelect = mock(() => {
  dbSelectCallIdx += 1

  if (dbSelectCallIdx === 1) {
    return { from: interviewsFrom }
  }

  return { from: slotsFrom }
})

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
  },
}))

describe("src/server/services/interviews/list-for-company", () => {
  beforeEach(() => {
    dbSelectResults.length = 0
    dbSelectCallIdx = 0

    interviewsLimit.mockClear()
    interviewsOrderBy.mockClear()
    interviewsWhere.mockClear()
    interviewsJoinOffers.mockClear()
    interviewsJoinUsers.mockClear()
    interviewsFrom.mockClear()
    slotsOrderBy.mockClear()
    slotsWhere.mockClear()
    slotsFrom.mockClear()
    dbSelect.mockClear()

    interviewsFrom.mockReturnValue({ innerJoin: interviewsJoinUsers })
    interviewsJoinUsers.mockReturnValue({ innerJoin: interviewsJoinOffers })
    interviewsJoinOffers.mockReturnValue({ where: interviewsWhere })
    interviewsWhere.mockReturnValue({ orderBy: interviewsOrderBy })
    interviewsOrderBy.mockReturnValue({ limit: interviewsLimit })

    slotsFrom.mockReturnValue({ where: slotsWhere })
    slotsWhere.mockReturnValue({ orderBy: slotsOrderBy })
  })

  test("should return empty array when company has no interviews", async () => {
    dbSelectResults.push([])

    const { listInterviewsForCompany } = await import(
      "@/server/services/interviews/list-for-company?fresh=1" as string
    )

    const result = await listInterviewsForCompany("company-1")

    expect(result).toEqual([])
    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(interviewsLimit).toHaveBeenCalledTimes(1)
  })

  test("should group slots by interview and keep empty slots as empty list", async () => {
    const createdAt1 = new Date("2030-04-01T00:00:00.000Z")
    const createdAt2 = new Date("2030-04-02T00:00:00.000Z")

    dbSelectResults.push([
      {
        id: "interview-1",
        applicationId: "application-1",
        offerId: "offer-1",
        offerTitle: "Frontend Internship",
        studentUserId: "student-1",
        studentName: "Student One",
        studentImage: null,
        status: "pending_confirmation",
        confirmedSlotId: null,
        confirmedAt: null,
        note: "Bring portfolio",
        createdAt: createdAt1,
        updatedAt: createdAt1,
      },
      {
        id: "interview-2",
        applicationId: "application-2",
        offerId: "offer-1",
        offerTitle: "Frontend Internship",
        studentUserId: "student-2",
        studentName: "Student Two",
        studentImage: null,
        status: "confirmed",
        confirmedSlotId: "slot-2",
        confirmedAt: createdAt2,
        note: null,
        createdAt: createdAt2,
        updatedAt: createdAt2,
      },
    ])
    dbSelectResults.push([
      {
        id: "slot-1",
        interviewId: "interview-1",
        startsAt: new Date("2030-04-10T09:00:00.000Z"),
        endsAt: new Date("2030-04-10T10:00:00.000Z"),
        location: "HQ",
        meetingUrl: null,
      },
    ])

    const { listInterviewsForCompany } = await import(
      "@/server/services/interviews/list-for-company?fresh=2" as string
    )

    const result = await listInterviewsForCompany("company-1", {
      offerId: "offer-1",
      status: "pending_confirmation",
      limit: 10,
    })

    expect(dbSelect).toHaveBeenCalledTimes(2)
    expect(interviewsLimit).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(2)

    expect(result[0]).toMatchObject({
      id: "interview-1",
      slots: [
        {
          id: "slot-1",
          interviewId: "interview-1",
          location: "HQ",
        },
      ],
    })

    expect(result[1]).toMatchObject({
      id: "interview-2",
      slots: [],
    })
  })
})
