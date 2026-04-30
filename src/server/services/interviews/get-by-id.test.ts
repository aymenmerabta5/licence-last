import { beforeEach, describe, expect, mock, test } from "bun:test"

const dbSelectResults: unknown[][] = []
let dbSelectCallIdx = 0

function getCurrentSelectResults() {
  return dbSelectResults[dbSelectCallIdx - 1] ?? []
}

const interviewLimit = mock(() => Promise.resolve(getCurrentSelectResults()))
const interviewWhere = mock(() => ({ limit: interviewLimit }))
const interviewJoinOffers = mock(() => ({ where: interviewWhere }))
const interviewJoinCompanies = mock(() => ({ innerJoin: interviewJoinOffers }))
const interviewFrom = mock(() => ({ innerJoin: interviewJoinCompanies }))

const slotsOrderBy = mock(() => Promise.resolve(getCurrentSelectResults()))
const slotsWhere = mock(() => ({ orderBy: slotsOrderBy }))
const slotsFrom = mock(() => ({ where: slotsWhere }))

const dbSelect = mock(() => {
  dbSelectCallIdx += 1

  if (dbSelectCallIdx === 1) {
    return { from: interviewFrom }
  }

  return { from: slotsFrom }
})

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
  },
}))

describe("src/server/services/interviews/get-by-id", () => {
  beforeEach(() => {
    dbSelectResults.length = 0
    dbSelectCallIdx = 0

    interviewLimit.mockClear()
    interviewWhere.mockClear()
    interviewJoinOffers.mockClear()
    interviewJoinCompanies.mockClear()
    interviewFrom.mockClear()
    slotsOrderBy.mockClear()
    slotsWhere.mockClear()
    slotsFrom.mockClear()
    dbSelect.mockClear()

    interviewFrom.mockReturnValue({ innerJoin: interviewJoinCompanies })
    interviewJoinCompanies.mockReturnValue({ innerJoin: interviewJoinOffers })
    interviewJoinOffers.mockReturnValue({ where: interviewWhere })
    interviewWhere.mockReturnValue({ limit: interviewLimit })

    slotsFrom.mockReturnValue({ where: slotsWhere })
    slotsWhere.mockReturnValue({ orderBy: slotsOrderBy })
  })

  test("should return interview with slots when student owns it", async () => {
    const createdAt = new Date("2030-04-01T00:00:00.000Z")
    const updatedAt = new Date("2030-04-01T12:00:00.000Z")
    const slotStartsAt = new Date("2030-04-10T09:00:00.000Z")
    const slotEndsAt = new Date("2030-04-10T10:00:00.000Z")

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
        createdAt,
        updatedAt,
        studentUserId: "student-1",
      },
    ])
    dbSelectResults.push([
      {
        id: "slot-1",
        interviewId: "interview-1",
        startsAt: slotStartsAt,
        endsAt: slotEndsAt,
        location: "HQ Room A",
        meetingUrl: "https://meet.example.com/slot-1",
      },
      {
        id: "slot-2",
        interviewId: "interview-1",
        startsAt: new Date("2030-04-11T09:00:00.000Z"),
        endsAt: new Date("2030-04-11T10:00:00.000Z"),
        location: null,
        meetingUrl: null,
      },
    ])

    const { getInterviewById } = await import(
      "@/server/services/interviews/get-by-id?fresh=1" as string
    )

    const result = await getInterviewById("interview-1", "student-1")

    expect(dbSelect).toHaveBeenCalledTimes(2)
    expect(result).toMatchObject({
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
      createdAt,
      updatedAt,
    })
    expect(result.slots).toHaveLength(2)
    expect(result.slots[0]).toMatchObject({
      id: "slot-1",
      interviewId: "interview-1",
      startsAt: slotStartsAt,
      endsAt: slotEndsAt,
      location: "HQ Room A",
      meetingUrl: "https://meet.example.com/slot-1",
    })
    expect(result.slots[1]).toMatchObject({
      id: "slot-2",
      interviewId: "interview-1",
    })
  })

  test("should return interview with empty slots when no slots exist", async () => {
    const createdAt = new Date("2030-04-01T00:00:00.000Z")
    const updatedAt = new Date("2030-04-01T12:00:00.000Z")

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
        createdAt,
        updatedAt,
        studentUserId: "student-1",
      },
    ])
    dbSelectResults.push([])

    const { getInterviewById } = await import(
      "@/server/services/interviews/get-by-id?fresh=4" as string
    )

    const result = await getInterviewById("interview-1", "student-1")

    expect(dbSelect).toHaveBeenCalledTimes(2)
    expect(result).toMatchObject({
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
      createdAt,
      updatedAt,
    })
    expect(result.slots).toEqual([])
  })

  test("should throw INTERVIEW_NOT_FOUND for nonexistent interview", async () => {
    dbSelectResults.push([])

    const { getInterviewById } = await import(
      "@/server/services/interviews/get-by-id?fresh=2" as string
    )

    await expect(getInterviewById("interview-missing", "student-1")).rejects.toThrow(
      "Interview not found",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
  })

  test("should throw INTERVIEW_FORBIDDEN when another student tries to access", async () => {
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
        note: null,
        createdAt: new Date("2030-04-01T00:00:00.000Z"),
        updatedAt: new Date("2030-04-01T12:00:00.000Z"),
        studentUserId: "student-2",
      },
    ])

    const { getInterviewById } = await import(
      "@/server/services/interviews/get-by-id?fresh=3" as string
    )

    await expect(getInterviewById("interview-1", "student-1")).rejects.toThrow(
      "You do not have access to this interview",
    )

    expect(dbSelect).toHaveBeenCalledTimes(1)
  })
})
