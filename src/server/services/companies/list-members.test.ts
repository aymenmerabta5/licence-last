import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockRows: any[] = []

const mockWhere = mock(() => Promise.resolve(mockRows))
const mockInnerJoin = mock(() => ({ where: mockWhere }))
const mockFrom = mock(() => ({ innerJoin: mockInnerJoin }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/companies/list-members", () => {
  beforeEach(() => {
    mockRows = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockInnerJoin.mockClear()
    mockWhere.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockWhere })
  })

  test("returns members with owner first", async () => {
    mockRows = [
      {
        userId: "u-2",
        email: "recruiter@example.com",
        name: "Recruiter",
        role: "recruiter",
        joinedAt: new Date("2026-01-02T00:00:00.000Z"),
      },
      {
        userId: "u-1",
        email: "owner@example.com",
        name: "Owner",
        role: "owner",
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]

    const { listCompanyMembers } = await import(
      "@/server/services/companies/list-members?fresh=1"
    )
    const result = await listCompanyMembers("company-1")

    expect(result.map((member: { userId: string }) => member.userId)).toEqual([
      "u-1",
      "u-2",
    ])
  })

  afterAll(() => {
    mock.restore()
  })
})

