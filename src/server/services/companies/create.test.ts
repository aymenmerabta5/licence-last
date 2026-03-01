import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))
const mockWhere = mock(() => Promise.resolve())
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))
const mockTransaction = mock(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (fn: (tx: any) => Promise<void>) => {
    await fn({
      insert: mockInsert,
      update: mockUpdate,
    })
  },
)

const dbMock = {
  insert: mockInsert,
  update: mockUpdate,
  transaction: mockTransaction,
}

mock.module("@/server/db", () => ({ db: dbMock }))

const VERIFICATION_DOCUMENT = {
  key: "company-verification/user-1/doc-1.pdf",
  fileName: "trade-license.pdf",
  mimeType: "application/pdf",
  fileSizeBytes: 1024,
}

describe("src/server/services/companies/create", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockTransaction.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockResolvedValue(undefined)
    mockTransaction.mockImplementation(async (fn) => {
      await fn({
        insert: mockInsert,
        update: mockUpdate,
      })
    })
  })

  test("should create a company and return companyId and slug", async () => {
    const { createCompany } = await import(
      "@/server/services/companies/create?fresh=1"
    )

    const result = await createCompany(
      {
        name: "Acme Corp",
        description: "Test company",
        wilayaCode: 16,
        verificationDocument: VERIFICATION_DOCUMENT,
      },
      "user-1",
    )

    expect(result.companyId).toBeDefined()
    expect(result.slug).toMatch(/^acme-corp-[a-f0-9-]{12}$/)
  })

  test("should call insert for company and companyMember in transaction", async () => {
    const { createCompany } = await import(
      "@/server/services/companies/create?fresh=2"
    )

    await createCompany(
      {
        name: "Test Co",
        wilayaCode: 1,
        verificationDocument: VERIFICATION_DOCUMENT,
      },
      "user-2",
    )

    // 2 inserts (company + member) + 1 update (onboardingCompleted)
    expect(mockInsert).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    const firstInsertValues = (
      mockValues.mock.calls[0] as unknown as [Record<string, unknown>] | undefined
    )?.[0]

    expect(firstInsertValues).toMatchObject({
      verificationDocumentKey: "company-verification/user-1/doc-1.pdf",
      verificationDocumentName: "trade-license.pdf",
      verificationDocumentMimeType: "application/pdf",
      verificationDocumentSizeBytes: 1024,
    })
  })

  test("should generate a URL-safe slug from company name", async () => {
    const { createCompany } = await import(
      "@/server/services/companies/create?fresh=3"
    )

    const result = await createCompany(
      {
        name: "My Company! @#$%",
        wilayaCode: 16,
        verificationDocument: VERIFICATION_DOCUMENT,
      },
      "user-3",
    )

    // Slug should strip special chars and lowercase
    expect(result.slug).toMatch(/^my-company-[a-f0-9-]{12}$/)
  })

  test("should map company membership unique conflicts to service errors", async () => {
    mockTransaction.mockRejectedValueOnce({
      code: "23505",
      constraint: "company_member_userId_uidx",
    })

    const { createCompany } = await import(
      "@/server/services/companies/create?fresh=4"
    )

    await expect(
      createCompany(
        {
          name: "Conflict Co",
          wilayaCode: 1,
          verificationDocument: VERIFICATION_DOCUMENT,
        },
        "user-4",
      ),
    ).rejects.toMatchObject({
      code: "COMPANY_MEMBERSHIP_ALREADY_EXISTS",
      message: "Company admin is already assigned to a company",
    })
  })
})
