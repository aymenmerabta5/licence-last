import { beforeEach, describe, expect, mock, test } from "bun:test"

let dbRows: unknown[] = []

const dbLimit = mock(() => Promise.resolve(dbRows))
const dbOrderBy = mock(() => ({ limit: dbLimit }))
const dbWhere = mock(() => ({ orderBy: dbOrderBy }))
const dbLeftJoin = mock(() => ({ where: dbWhere }))
const dbInnerJoin2 = mock(() => ({ leftJoin: dbLeftJoin }))
const dbInnerJoin1 = mock(() => ({ innerJoin: dbInnerJoin2 }))
const dbFrom = mock(() => ({ innerJoin: dbInnerJoin1 }))
const dbSelect = mock(() => ({ from: dbFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: dbSelect,
  },
}))

describe("src/server/services/messages/list-starters-by-company", () => {
  beforeEach(() => {
    dbRows = []

    dbSelect.mockClear()
    dbFrom.mockClear()
    dbInnerJoin1.mockClear()
    dbInnerJoin2.mockClear()
    dbLeftJoin.mockClear()
    dbWhere.mockClear()
    dbOrderBy.mockClear()
    dbLimit.mockClear()

    dbFrom.mockReturnValue({ innerJoin: dbInnerJoin1 })
    dbInnerJoin1.mockReturnValue({ innerJoin: dbInnerJoin2 })
    dbInnerJoin2.mockReturnValue({ leftJoin: dbLeftJoin })
    dbLeftJoin.mockReturnValue({ where: dbWhere })
    dbWhere.mockReturnValue({ orderBy: dbOrderBy })
    dbOrderBy.mockReturnValue({ limit: dbLimit })
  })

  test("should list starter conversations for company applicants without threads", async () => {
    dbRows = [
      {
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-1",
        studentName: "Student One",
        studentImage: "https://example.com/student.png",
      },
    ]

    const { listMessageStartersByCompany } = await import(
      "@/server/services/messages/list-starters-by-company?fresh=1" as string
    )

    const result = await listMessageStartersByCompany("company-1")

    expect(result).toEqual([
      {
        id: "offer-1:student-1",
        offerId: "offer-1",
        offerTitle: "Frontend Intern",
        studentUserId: "student-1",
        studentName: "Student One",
        studentImage: "https://example.com/student.png",
      },
    ])
    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbLimit).toHaveBeenCalledWith(24)
  })
})
