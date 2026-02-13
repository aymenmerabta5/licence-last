import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))
const mockWhere = mock(() => Promise.resolve())
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

const dbMock = {
  insert: mockInsert,
  update: mockUpdate,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: async (fn: (tx: any) => Promise<void>) => {
    await fn({
      insert: mockInsert,
      update: mockUpdate,
    })
  },
}

mock.module("@/server/db", () => ({ db: dbMock }))

describe("src/server/services/companies/create", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockResolvedValue(undefined)
  })

  test("should create a company and return companyId and slug", async () => {
    const { createCompany } = await import("./create")

    const result = await createCompany(
      {
        name: "Acme Corp",
        description: "Test company",
        wilayaCode: 16,
      },
      "user-1",
    )

    expect(result.companyId).toBeDefined()
    expect(result.slug).toMatch(/^acme-corp-[a-z0-9]{6}$/)
  })

  test("should call insert for company and companyMember in transaction", async () => {
    const { createCompany } = await import("./create")

    await createCompany(
      {
        name: "Test Co",
        wilayaCode: 1,
      },
      "user-2",
    )

    // 2 inserts (company + member) + 1 update (onboardingCompleted)
    expect(mockInsert).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should generate a URL-safe slug from company name", async () => {
    const { createCompany } = await import("./create")

    const result = await createCompany(
      {
        name: "My Company! @#$%",
        wilayaCode: 16,
      },
      "user-3",
    )

    // Slug should strip special chars and lowercase
    expect(result.slug).toMatch(/^my-company-[a-z0-9]{6}$/)
  })
})
