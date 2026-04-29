import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockSelectResult: any[] = []

let mockUpdateResult: any[] = []

const mockSelectLimit = mock(() => Promise.resolve(mockSelectResult))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

const mockReturning = mock(() => Promise.resolve(mockUpdateResult))
const mockUpdateWhere = mock(() => ({ returning: mockReturning }))
const mockUpdateSet = mock(() => ({ where: mockUpdateWhere }))
const mockUpdate = mock(() => ({ set: mockUpdateSet }))

let importCounter = 0

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
  },
}))

async function loadModule() {
  importCounter += 1
  return import(
    `@/server/services/companies/trust-actions?resolve-test=${importCounter}`
  )
}

describe("src/server/services/companies/trust-actions resolveCompanyReport", () => {
  beforeEach(() => {
    mockSelectResult = []
    mockUpdateResult = []

    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectWhere.mockClear()
    mockSelectLimit.mockClear()
    mockUpdate.mockClear()
    mockUpdateSet.mockClear()
    mockUpdateWhere.mockClear()
    mockReturning.mockClear()

    mockSelect.mockReturnValue({ from: mockSelectFrom })
    mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockSelectLimit })
    mockUpdate.mockReturnValue({ set: mockUpdateSet })
    mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockReturnValue({ returning: mockReturning })
  })

  test("resolves an open report", async () => {
    mockUpdateResult = [{ id: "report-1" }]

    const { resolveCompanyReport } = await loadModule()
    const result = await resolveCompanyReport({
      reportId: "report-1",
      adminUserId: "admin-1",
      status: "resolved",
      resolutionNote: "Closed after review",
    })

    expect(result).toEqual({ reportId: "report-1", status: "resolved" })
  })

  test("throws when the report is missing", async () => {
    mockUpdateResult = []
    mockSelectResult = []

    const { resolveCompanyReport } = await loadModule()

    await expect(
      resolveCompanyReport({
        reportId: "missing",
        adminUserId: "admin-1",
        status: "resolved",
      }),
    ).rejects.toThrow("Report not found")
  })

  test("throws when the report is already closed", async () => {
    mockUpdateResult = []
    mockSelectResult = [{ id: "report-1", status: "dismissed" }]

    const { resolveCompanyReport } = await loadModule()

    await expect(
      resolveCompanyReport({
        reportId: "report-1",
        adminUserId: "admin-1",
        status: "resolved",
      }),
    ).rejects.toThrow("Report is already closed")
  })
})
