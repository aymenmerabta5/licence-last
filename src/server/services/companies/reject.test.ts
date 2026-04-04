import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockReturningResult: any[] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSelectResult: any[] = []

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))
const mockSelectLimit = mock(() => Promise.resolve(mockSelectResult))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))
let moduleImportCounter = 0

function applyRejectCompanyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      update: mockUpdate,
    },
  }))
}

async function loadRejectCompanyModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/companies/reject?test=${moduleImportCounter}`
  )
}

describe("src/server/services/companies/reject", () => {
  beforeEach(() => {
    applyRejectCompanyMocks()
    mockReturningResult = []
    mockSelectResult = []
    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectWhere.mockClear()
    mockSelectLimit.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockSelect.mockReturnValue({ from: mockSelectFrom })
    mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockSelectLimit })
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should reject a company and return its id and name", async () => {
    mockReturningResult = [{ id: "company-1", name: "Bad Corp" }]

    const { rejectCompany } = await loadRejectCompanyModule()
    const result = await rejectCompany(
      "company-1",
      "Incomplete documentation",
      "admin-1",
    )

    expect(result).toEqual({ companyId: "company-1", name: "Bad Corp" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when company not found", async () => {
    mockReturningResult = []
    mockSelectResult = []

    const { rejectCompany } = await loadRejectCompanyModule()

    await expect(rejectCompany("missing", "reason", "admin-1")).rejects.toThrow(
      "Company not found",
    )
  })

  test("should reject companies that are no longer pending", async () => {
    mockReturningResult = []
    mockSelectResult = [{ id: "company-1", status: "approved" }]

    const { rejectCompany } = await loadRejectCompanyModule()

    await expect(
      rejectCompany("company-1", "reason", "admin-1"),
    ).rejects.toThrow("Only pending companies can be rejected")
  })
})
