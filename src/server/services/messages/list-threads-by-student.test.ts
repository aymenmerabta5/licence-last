import { beforeEach, describe, expect, mock, test } from "bun:test"

let dbRows: unknown[] = []

const dbLimit = mock(() => Promise.resolve(dbRows))
const dbOrderBy = mock(() => ({ limit: dbLimit }))
const dbWhere = mock(() => ({ orderBy: dbOrderBy }))
const dbInnerJoin2 = mock(() => ({ where: dbWhere }))
const dbInnerJoin1 = mock(() => ({ innerJoin: dbInnerJoin2 }))
const dbFrom = mock(() => ({ innerJoin: dbInnerJoin1 }))
const dbSelect = mock(() => ({ from: dbFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
  },
}))

describe("src/server/services/messages/list-threads-by-student", () => {
  beforeEach(() => {
    dbRows = []

    dbSelect.mockClear()
    dbFrom.mockClear()
    dbInnerJoin1.mockClear()
    dbInnerJoin2.mockClear()
    dbWhere.mockClear()
    dbOrderBy.mockClear()
    dbLimit.mockClear()

    dbFrom.mockReturnValue({ innerJoin: dbInnerJoin1 })
    dbInnerJoin1.mockReturnValue({ innerJoin: dbInnerJoin2 })
    dbInnerJoin2.mockReturnValue({ where: dbWhere })
    dbWhere.mockReturnValue({ orderBy: dbOrderBy })
    dbOrderBy.mockReturnValue({ limit: dbLimit })
  })

  test("should list student threads with default limit", async () => {
    const rows = [
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Backend Intern",
        companyId: "company-1",
        companyName: "Internex",
        companyLogoUrl: null,
        lastMessageAt: new Date("2030-01-03T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
      },
    ]
    dbRows = rows

    const { listMessageThreadsByStudent } = await import(
      "@/server/services/messages/list-threads-by-student?fresh=1" as string
    )

    const result = await listMessageThreadsByStudent("student-1")

    expect(result).toEqual(rows)
    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbLimit).toHaveBeenCalledWith(30)
  })

  test("should list student threads with provided limit", async () => {
    const rows = [
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Backend Intern",
        companyId: "company-1",
        companyName: "Internex",
        companyLogoUrl: null,
        lastMessageAt: new Date("2030-01-03T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
      },
      {
        id: "thread-2",
        offerId: "offer-2",
        offerTitle: "Frontend Intern",
        companyId: "company-2",
        companyName: "Aster Labs",
        companyLogoUrl: "https://example.com/aster.png",
        lastMessageAt: new Date("2030-01-04T00:00:00.000Z"),
        createdAt: new Date("2030-01-02T00:00:00.000Z"),
      },
    ]
    dbRows = rows

    const { listMessageThreadsByStudent } = await import(
      "@/server/services/messages/list-threads-by-student?fresh=2" as string
    )

    const result = await listMessageThreadsByStudent("student-1", { limit: 2 })

    expect(result).toEqual(rows)
    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbLimit).toHaveBeenCalledWith(2)
  })
})
