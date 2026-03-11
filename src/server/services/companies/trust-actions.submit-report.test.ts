import { beforeEach, describe, expect, mock, test } from "bun:test"

const relationshipQueryResults: Array<Array<Record<string, unknown>>> = []
const insertedReportRows: Array<Record<string, unknown>> = []

const mockSelectLimit = mock(() =>
  Promise.resolve(relationshipQueryResults.shift() ?? []),
)
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectInnerJoin = mock(() => ({
  innerJoin: mockSelectInnerJoin,
  where: mockSelectWhere,
}))
const mockSelectFrom = mock(() => ({
  innerJoin: mockSelectInnerJoin,
  where: mockSelectWhere,
}))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

const mockInsertValues = mock((values: Record<string, unknown>) => {
  insertedReportRows.push(values)
  return Promise.resolve()
})
const mockInsert = mock(() => ({ values: mockInsertValues }))
let moduleImportCounter = 0

function applySubmitCompanyReportMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
  }))
}

async function loadTrustActionsModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/companies/trust-actions?test=${moduleImportCounter}`
  )
}

describe("src/server/services/companies/trust-actions submitCompanyReport", () => {
  beforeEach(() => {
    applySubmitCompanyReportMocks()
    relationshipQueryResults.length = 0
    insertedReportRows.length = 0

    mockSelectLimit.mockClear()
    mockSelectWhere.mockClear()
    mockSelectInnerJoin.mockClear()
    mockSelectFrom.mockClear()
    mockSelect.mockClear()

    mockInsertValues.mockClear()
    mockInsert.mockClear()
  })

  test("allows misleading_offer reports without prior relationship", async () => {
    const { submitCompanyReport } = await loadTrustActionsModule()

    const result = await submitCompanyReport({
      reporterUserId: "student-1",
      companyId: "company-1",
      category: "misleading_offer",
      severity: "medium",
      description: "  The listed role responsibilities were inaccurate.  ",
    })

    expect(result.reportId).toEqual(expect.any(String))
    expect(mockSelect).not.toHaveBeenCalled()
    expect(mockInsertValues).toHaveBeenCalledTimes(1)
    expect(insertedReportRows[0]).toMatchObject({
      reporterUserId: "student-1",
      companyId: "company-1",
      category: "misleading_offer",
      severity: "medium",
      description: "The listed role responsibilities were inaccurate.",
    })
  })

  test("throws typed error when relationship is required but missing", async () => {
    relationshipQueryResults.push([], [], [])

    const { submitCompanyReport } = await loadTrustActionsModule()

    await expect(
      submitCompanyReport({
        reporterUserId: "student-1",
        companyId: "company-1",
        category: "professional_conduct",
        severity: "medium",
        description: "The company acted unprofessionally during interviews.",
      }),
    ).rejects.toMatchObject({
      code: "COMPANY_REPORT_RELATIONSHIP_REQUIRED",
      message:
        "You can only report companies you have applied to, worked with, or are a member of",
    })

    expect(mockInsertValues).not.toHaveBeenCalled()
  })

  test("allows relationship-required reports when an application exists", async () => {
    relationshipQueryResults.push([{ id: "application-1" }])

    const { submitCompanyReport } = await loadTrustActionsModule()

    const result = await submitCompanyReport({
      reporterUserId: "student-1",
      companyId: "company-1",
      category: "professional_conduct",
      severity: "high",
      description: "Interview process contained repeated policy violations.",
    })

    expect(result.reportId).toEqual(expect.any(String))
    expect(mockSelectLimit).toHaveBeenCalledTimes(1)
    expect(mockInsertValues).toHaveBeenCalledTimes(1)
  })
})
