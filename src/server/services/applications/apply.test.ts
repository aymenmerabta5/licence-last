import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectResults: any[][] = []
let selectCallIdx = 0

const mockLimit = mock(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})

const mockWhereWithLimit = mock(() => ({ limit: mockLimit }))
const mockFromWithLimit = mock(() => ({ where: mockWhereWithLimit }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhereNoLimit = mock<() => Promise<any[]>>(() => {
  const results = mockSelectResults[selectCallIdx - 1] ?? []
  return Promise.resolve(results)
})
const mockFromNoLimit = mock(() => ({ where: mockWhereNoLimit }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      // Call 1: offer query (limit)
      // Call 2: validated count (no limit)
      // Call 3: existing application (limit)
      // Call 4: company members (no limit)
      if (selectCallIdx === 1 || selectCallIdx === 3) {
        return { from: mockFromWithLimit }
      }
      return { from: mockFromNoLimit }
    },
    insert: mockInsert,
  },
}))

describe("src/server/services/applications/apply", () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0

    mockLimit.mockClear()
    mockWhereWithLimit.mockClear()
    mockFromWithLimit.mockClear()
    mockWhereNoLimit.mockClear()
    mockFromNoLimit.mockClear()

    mockInsert.mockClear()
    mockValues.mockClear()

    mockFromWithLimit.mockReturnValue({ where: mockWhereWithLimit })
    mockWhereWithLimit.mockReturnValue({ limit: mockLimit })

    mockFromNoLimit.mockReturnValue({ where: mockWhereNoLimit })

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should throw when offer does not exist", async () => {
    mockSelectResults.push([])

    const { applyToOffer } = await import("./apply")

    await expect(applyToOffer("offer-1", "student-1")).rejects.toThrow(
      "Offer not found",
    )
  })

  test("should throw when positions are full", async () => {
    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Frontend Intern",
        status: "published",
        closesAt: null,
        maxPositions: 1,
      },
    ])
    mockSelectResults.push([{ value: 1 }])

    const { applyToOffer } = await import("./apply")

    await expect(applyToOffer("offer-1", "student-1")).rejects.toThrow(
      "All positions have been filled",
    )
  })

  test("should create application and notify company members", async () => {
    mockSelectResults.push([
      {
        id: "offer-1",
        companyId: "company-1",
        title: "Frontend Intern",
        status: "published",
        closesAt: null,
        maxPositions: 2,
      },
    ])
    mockSelectResults.push([{ value: 0 }])
    mockSelectResults.push([])
    mockSelectResults.push([{ userId: "member-1" }, { userId: "member-2" }])

    const { applyToOffer } = await import("./apply")

    const result = await applyToOffer(
      "offer-1",
      "student-1",
      "Short cover letter",
    )

    expect(result.applicationId).toBeDefined()
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })
})
