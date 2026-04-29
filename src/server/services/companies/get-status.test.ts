import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
let mockLimitResult: any[] = []

const mockLimit = mock(() => Promise.resolve(mockLimitResult))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockInnerJoin = mock(() => ({ where: mockWhere }))
const mockFrom = mock(() => ({ innerJoin: mockInnerJoin }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/companies/get-status", () => {
  let importCounter = 0

  async function importGetCompanyStatus() {
    importCounter += 1
    return import(
      `@/server/services/companies/get-status?test=${importCounter}`
    )
  }

  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    mock.module("@/server/db", () => ({
      db: {
        select: mockSelect,
      },
    }))
    mockLimitResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockInnerJoin.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockInnerJoin.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("returns company status when membership exists", async () => {
    mockLimitResult = [
      { id: "company-1", status: "approved", rejectionReason: null },
    ]

    const { getCompanyStatusByUserId } = await importGetCompanyStatus()
    const result = await getCompanyStatusByUserId("user-1")

    expect(result).toEqual({
      id: "company-1",
      status: "approved",
      rejectionReason: null,
    })
  })

  test("returns null when user has no company membership", async () => {
    mockLimitResult = []

    const { getCompanyStatusByUserId } = await importGetCompanyStatus()
    const result = await getCompanyStatusByUserId("user-2")

    expect(result).toBeNull()
  })

  test("throws conflict error when user belongs to multiple companies", async () => {
    mockLimitResult = [
      { id: "company-1", status: "approved", rejectionReason: null },
      { id: "company-2", status: "approved", rejectionReason: null },
    ]

    const { getCompanyStatusByUserId } = await importGetCompanyStatus()

    await expect(getCompanyStatusByUserId("user-3")).rejects.toMatchObject({
      code: "COMPANY_MEMBERSHIP_CONFLICT",
    })
  })
})
