import { beforeEach, describe, expect, mock, test } from "bun:test"

const queryQueue: unknown[][] = []

const mockOrderBy = mock(() => {
  const rows = queryQueue.shift() ?? []
  return Promise.resolve(rows)
})

const mockWhere = mock(() => {
  const rows = queryQueue.shift() ?? []
  return Promise.resolve(rows)
})

const mockInnerJoin = mock(() => ({
  innerJoin: mock(() => ({
    where: mock(() => ({
      orderBy: mockOrderBy,
    })),
  })),
}))

const mockFrom = mock(() => ({
  innerJoin: mockInnerJoin,
  where: mockWhere,
}))

const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/applications/list-student-journeys", () => {
  beforeEach(() => {
    queryQueue.length = 0
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockInnerJoin.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()
  })

  test("should return empty array for student with no applications", async () => {
    queryQueue.push([])

    const { listStudentApplicationJourneys } = await import(
      `@/server/services/applications/list-student-journeys?fresh=${Date.now()}`
    )

    const result = await listStudentApplicationJourneys("student-1")
    expect(result).toEqual([])
  })

  test("should return journey with no interviews and no placement", async () => {
    const appRow = {
      id: "app-1",
      status: "applied",
      pipelineStage: "applied",
      createdAt: new Date("2024-01-01"),
      offerId: "offer-1",
      offerTitle: "Frontend Intern",
      offerInternshipType: "pfe",
      offerWorkMode: "remote",
      offerWilayaCode: 16,
      companyName: "Acme",
      companySlug: "acme",
      companyLogoUrl: null,
    }

    queryQueue.push([appRow], [], [])

    const { listStudentApplicationJourneys } = await import(
      `@/server/services/applications/list-student-journeys?fresh=${Date.now()}`
    )

    const result = await listStudentApplicationJourneys("student-1")
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: "app-1",
      status: "applied",
      pipelineStage: "applied",
      offerId: "offer-1",
      offerTitle: "Frontend Intern",
      interviews: [],
      placement: null,
    })
  })

  test("should return journey with interviews and slots", async () => {
    const appRow = {
      id: "app-1",
      status: "applied",
      pipelineStage: "interview",
      createdAt: new Date("2024-01-01"),
      offerId: "offer-1",
      offerTitle: "Frontend Intern",
      offerInternshipType: "pfe",
      offerWorkMode: "remote",
      offerWilayaCode: 16,
      companyName: "Acme",
      companySlug: "acme",
      companyLogoUrl: null,
    }
    const interviewRow = {
      id: "int-1",
      applicationId: "app-1",
      status: "confirmed",
      note: "Looking forward",
      confirmedSlotId: "slot-1",
    }
    const slotRow = {
      id: "slot-1",
      interviewId: "int-1",
      startsAt: new Date("2024-02-01T10:00:00Z"),
      endsAt: new Date("2024-02-01T11:00:00Z"),
      location: "Room A",
      meetingUrl: "https://meet.example.com/abc",
    }

    queryQueue.push([appRow], [interviewRow], [slotRow], [])

    const { listStudentApplicationJourneys } = await import(
      `@/server/services/applications/list-student-journeys?fresh=${Date.now()}`
    )

    const result = await listStudentApplicationJourneys("student-1")
    expect(result).toHaveLength(1)
    expect(result[0].interviews).toHaveLength(1)
    expect(result[0].interviews[0]).toMatchObject({
      id: "int-1",
      status: "confirmed",
      note: "Looking forward",
      confirmedSlotId: "slot-1",
      slots: [
        {
          id: "slot-1",
          startsAt: slotRow.startsAt,
          endsAt: slotRow.endsAt,
          location: "Room A",
          meetingUrl: "https://meet.example.com/abc",
        },
      ],
    })
    expect(result[0].placement).toBeNull()
  })

  test("should return journey with placement and documents", async () => {
    const appRow = {
      id: "app-1",
      status: "placed",
      pipelineStage: "placed",
      createdAt: new Date("2024-01-01"),
      offerId: "offer-1",
      offerTitle: "Frontend Intern",
      offerInternshipType: "pfe",
      offerWorkMode: "remote",
      offerWilayaCode: 16,
      companyName: "Acme",
      companySlug: "acme",
      companyLogoUrl: null,
    }
    const placementRow = {
      id: "pl-1",
      applicationId: "app-1",
      validatedByUserId: "user-1",
      validatedAt: new Date("2024-03-01"),
      startDate: new Date("2024-03-15"),
      endDate: new Date("2024-06-15"),
    }
    const docRow = {
      id: "doc-1",
      placementId: "pl-1",
      type: "agreement",
      status: "generated",
      verificationCode: "VER-123",
    }
    const validatorRow = {
      id: "user-1",
      name: "Admin User",
    }

    queryQueue.push([appRow], [], [placementRow], [docRow], [validatorRow])

    const { listStudentApplicationJourneys } = await import(
      `@/server/services/applications/list-student-journeys?fresh=${Date.now()}`
    )

    const result = await listStudentApplicationJourneys("student-1")
    expect(result).toHaveLength(1)
    expect(result[0].placement).not.toBeNull()
    expect(result[0].placement).toMatchObject({
      placementId: "pl-1",
      startDate: placementRow.startDate,
      endDate: placementRow.endDate,
      validatedAt: placementRow.validatedAt,
      validatedByName: "Admin User",
      documents: [
        {
          id: "doc-1",
          type: "agreement",
          status: "generated",
          verificationCode: "VER-123",
        },
      ],
    })
  })
})
