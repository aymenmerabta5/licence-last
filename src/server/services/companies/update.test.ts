import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock((): any => [])
let moduleImportCounter = 0

function applyUpdateCompanyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      update: mockUpdate,
    },
  }))
}

async function loadUpdateCompanyModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/companies/update?test=${moduleImportCounter}`
  )
}

describe("src/server/services/companies/update", () => {
  beforeEach(() => {
    applyUpdateCompanyMocks()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should update company and return companyId", async () => {
    mockReturning.mockResolvedValue([{ companyId: "company-1" }])

    const { updateCompany } = await loadUpdateCompanyModule()

    const result = await updateCompany("company-1", {
      description: "Updated description",
      phone: "0555123456",
    })

    expect(result).toEqual({ companyId: "company-1" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockSet).toHaveBeenCalledTimes(1)
  })

  test("should throw when company not found", async () => {
    mockReturning.mockResolvedValue([])

    const { updateCompany } = await loadUpdateCompanyModule()

    expect(
      updateCompany("nonexistent", { description: "test" }),
    ).rejects.toThrow("Company not found")
  })
})
