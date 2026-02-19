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
const interviewsJoinCompanies = mock(() => ({ innerJoin: interviewsJoinOffers }))
const interviewsFrom = mock(() => ({ innerJoin: interviewsJoinCompanies }))

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

describe("src/server/services/interviews/list-for-student", () => {
  beforeEach(() => {
    dbSelectResults.length = 0
    dbSelectCallIdx = 0

    interviewsLimit.mockClear()
    interviewsOrderBy.mockClear()
    interviewsWhere.mockClear()
    interviewsJoinOffers.mockClear()
    interviewsJoinCompanies.mockClear()
    interviewsFrom.mockClear()
    slotsOrderBy.mockClear()
    slotsWhere.mockClear()
    slotsFrom.mockClear()
    dbSelect.mockClear()

    interviewsFrom.mockReturnValue({ innerJoin: interviewsJoinCompanies })
    interviewsJoinCompanies.mockReturnValue({ innerJoin: interviewsJoinOffers })
    interviewsJoinOffers.mockReturnValue({ where: interviewsWhere })
    interviewsWhere.mockReturnValue({ orderBy: interviewsOrderBy })
    interviewsOrderBy.mockReturnValue({ limit: interviewsLimit })

    slotsFrom.mockReturnValue({ where: slotsWhere })
    slotsWhere.mockReturnValue({ orderBy: slotsOrderBy })
  })

  test("should return empty array when student has no interviews", async () => {
    dbSelectResults.push([])

    const { listInterviewsForStudent } = await import(
      "@/server/services/interviews/list-for-student?fresh=1" as string
    )

    const result = await listInterviewsForStudent("student-1")

    expect(result).toEqual([])
    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(interviewsLimit).toHaveBeenCalledTimes(1)
  })

  test("should group interview slots and keep unmatched interviews empty", async () => {
    const createdAt1 = new Date("2030-04-01T00:00:00.000Z")
    const createdAt2 = new Date("2030-04-02T00:00:00.000Z")

    dbSelectResults.push([
      {
        id: "interview-1",
        applicationId: "application-1",
        offerId: "offer-1",
        offerTitle: "Frontend Internship",
        companyId: "company-1",
        companyName: "Acme",
        companyLogoUrl: null,
        status: "pending_confirmation",
        confirmedSlotId: null,
        confirmedAt: null,
        note: "Choose one slot",
        createdAt: createdAt1,
        updatedAt: createdAt1,
      },
      {
        id: "interview-2",
        applicationId: "application-2",
        offerId: "offer-2",
        offerTitle: "Backend Internship",
        companyId: "company-2",
        companyName: "Beta",
        companyLogoUrl: null,
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
        location: null,
        meetingUrl: "https://meet.example.com/slot-1",
      },
    ])

    const { listInterviewsForStudent } = await import(
      "@/server/services/interviews/list-for-student?fresh=2" as string
    )

    const result = await listInterviewsForStudent("student-1", {
      status: "pending_confirmation",
      limit: 5,
    })

    expect(dbSelect).toHaveBeenCalledTimes(2)
    expect(interviewsLimit).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(2)

    expect(result[0]).toMatchObject({
      id: "interview-1",
      companyName: "Acme",
      slots: [
        {
          id: "slot-1",
          interviewId: "interview-1",
          meetingUrl: "https://meet.example.com/slot-1",
        },
      ],
    })

    expect(result[1]).toMatchObject({
      id: "interview-2",
      companyName: "Beta",
      slots: [],
    })
  })
})
