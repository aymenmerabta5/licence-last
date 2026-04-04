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

describe("src/server/services/messages/list-starters-by-student", () => {
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

  test("should list starter conversations for student applications without threads", async () => {
    dbRows = [
      {
        offerId: "offer-1",
        offerTitle: "Backend Intern",
        companyId: "company-1",
        companyName: "Stag",
        companyLogoUrl: "https://example.com/logo.png",
      },
    ]

    const { listMessageStartersByStudent } = await import(
      "@/server/services/messages/list-starters-by-student?fresh=1" as string
    )

    const result = await listMessageStartersByStudent("student-1")

    expect(result).toEqual([
      {
        id: "offer-1",
        offerId: "offer-1",
        offerTitle: "Backend Intern",
        companyId: "company-1",
        companyName: "Stag",
        companyLogoUrl: "https://example.com/logo.png",
      },
    ])
    expect(dbSelect).toHaveBeenCalledTimes(1)
    expect(dbLimit).toHaveBeenCalledWith(12)
  })
})
