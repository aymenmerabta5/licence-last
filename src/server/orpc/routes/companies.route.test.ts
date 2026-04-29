import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

import { ServiceError } from "@/server/services/errors"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

function createCompanyOwnerProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return async (args: {
        context?: { companyMembership?: { role?: string } }
      }) => {
        if (args.context?.companyMembership?.role !== "owner") {
          throw {
            code: "FORBIDDEN",
            message: "Company owner access required",
          }
        }

        return (fn as (value: typeof args) => Promise<unknown>)(args)
      }
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

interface CompanyMemberRow {
  userId: string
  email: string
  name: string
  role: "owner" | "recruiter"
  joinedAt: Date
}

const updateCompanyMock = mock(async () => ({ companyId: "company-1" }))
const createCompanyMock = mock(async () => ({ companyId: "company-1" }))
const uploadCompanyVerificationDocumentMock = mock(async () => ({
  key: "company-verification/user-1/doc-1.pdf",
  fileName: "trade-license.pdf",
  mimeType: "application/pdf",
  fileSizeBytes: 1024,
}))
const deleteFileMock = mock(async () => {})
const uploadImageToS3Mock = mock(async () => ({
  url: "https://example.com/logo.png",
}))
const downloadCompanyVerificationDocumentMock = mock(async () => ({
  buffer: Buffer.from("verification-document"),
  fileName: "trade-license.pdf",
  mimeType: "application/pdf",
}))
const listCompaniesMock = mock(
  async (): Promise<{
    companies: Array<Record<string, unknown>>
    hasMore: boolean
  }> => ({
    companies: [],
    hasMore: false,
  }),
)
const listPublicDirectoryCompaniesMock = mock(
  async (): Promise<{
    companies: Array<Record<string, unknown>>
    hasMore: boolean
    nextCursor?: { createdAt: string; id: string }
  }> => ({
    companies: [],
    hasMore: false,
    nextCursor: undefined,
  }),
)
const listCompanyMembersMock = mock(async (): Promise<CompanyMemberRow[]> => [])
const inviteCompanyMemberMock = mock(async () => ({
  userId: "member-1",
  email: "member@example.com",
  role: "recruiter",
  createdUser: true,
  alreadyMember: false,
}))
const removeCompanyMemberMock = mock(async () => ({
  removed: true,
  userId: "member-1",
}))
const deleteCompanyMock = mock(async () => ({
  success: true as const,
  companyId: "company-1",
  companyName: "ACME",
  affectedUserIds: ["owner-1", "member-1"],
}))
const revalidateTagMock = mock(() => {})
const emitNotificationMock = mock(async () => ({
  notificationId: "notification-1",
  inAppSkipped: false,
  emailAttempted: false,
  emailSkipped: false,
  emailSuccess: null,
}))
const getCompanyMembershipMock = mock(
  async (): Promise<{ companyId: string } | null> => null,
)
const submitCompanyReportMock = mock(
  async (): Promise<{ reportId: string }> => ({ reportId: "report-0" }),
)
const submitCompanyQualityFeedbackMock = mock(
  async (): Promise<{ feedbackId: string; companyId: string }> => ({
    feedbackId: "feedback-0",
    companyId: "company-0",
  }),
)
const isAdminRoleMock = mock(
  (role: string) =>
    role === "super_admin" ||
    role === "university_admin" ||
    role === "dept_head",
)

function createPdfFile(name = "verification.pdf"): File {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])
  const blob = new Blob([bytes], { type: "application/pdf" })
  return new File([blob], name, { type: "application/pdf" })
}

function applyCompaniesRouteMocks() {
  mock.module("@/server/orpc/rate-limited-procedures", () => ({
    publicProcedureStrict: createProcedureMock(),
    publicProcedureStandard: createProcedureMock(),
    authedSessionProcedureStandard: createProcedureMock(),
    authedSessionProcedureGenerous: createProcedureMock(),
    authedProcedureGenerous: createProcedureMock(),
    authedProcedureStandard: createProcedureMock(),
    authedProcedureStrict: createProcedureMock(),
    adminProcedureGenerous: createProcedureMock(),
    adminProcedureStandard: createProcedureMock(),
    adminProcedureAssistant: createProcedureMock(),
    universityProcedureAssistant: createProcedureMock(),
    assistantProcedureLimited: createProcedureMock(),
    companyAdminProcedureAssistant: createProcedureMock(),
    companyAdminProcedureGenerous: createProcedureMock(),
    companyAdminProcedureStandard: createProcedureMock(),
    companyOwnerProcedureStandard: createCompanyOwnerProcedureMock(),
    companyOwnerProcedureGenerous: createCompanyOwnerProcedureMock(),
    studentProcedureGenerous: createProcedureMock(),
    studentProcedureStandard: createProcedureMock(),
    deptHeadProcedureStandard: createProcedureMock(),
    deptHeadProcedureGenerous: createProcedureMock(),
    superAdminProcedureGenerous: createProcedureMock(),
    superAdminProcedureStandard: createProcedureMock(),
  }))

  mock.module("@/server/orpc/middleware", () => ({
    isAdminRole: isAdminRoleMock,
  }))

  mock.module("next/cache", () => ({
    cacheLife: () => {},
    cacheTag: () => {},
    revalidateTag: revalidateTagMock,
    revalidatePath: () => {},
    updateTag: () => {},

    unstable_cache: (fn: (...args: any[]) => any) => fn,
  }))

  mock.module("@/env", () => ({
    env: { NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000" },
  }))

  mock.module("@/server/services/companies/list", () => ({
    listCompanies: listCompaniesMock,
  }))
  mock.module("@/server/services/companies/list-public-directory", () => ({
    listPublicDirectoryCompanies: listPublicDirectoryCompaniesMock,
  }))
  mock.module("@/server/services/companies/get", () => ({
    getCompanyById: mock(async () => null),
    getCompanyByUserId: mock(async () => null),
  }))
  mock.module("@/server/services/companies/create", () => ({
    createCompany: createCompanyMock,
  }))
  mock.module(
    "@/server/services/companies/download-verification-document",
    () => ({
      downloadCompanyVerificationDocument:
        downloadCompanyVerificationDocumentMock,
    }),
  )
  mock.module("@/server/services/companies/update", () => ({
    updateCompany: updateCompanyMock,
  }))
  mock.module("@/server/services/companies/list-members", () => ({
    listCompanyMembers: listCompanyMembersMock,
  }))
  mock.module("@/server/services/companies/invite-member", () => ({
    inviteCompanyMember: inviteCompanyMemberMock,
  }))
  mock.module("@/server/services/companies/remove-member", () => ({
    removeCompanyMember: removeCompanyMemberMock,
  }))
  mock.module("@/server/services/companies/delete", () => ({
    deleteCompany: deleteCompanyMock,
  }))
  mock.module("@/server/services/companies/approve", () => ({
    approveCompany: mock(async () => ({ name: "ACME" })),
  }))
  mock.module("@/server/services/companies/reject", () => ({
    rejectCompany: mock(async () => ({ name: "ACME" })),
  }))
  mock.module("@/server/services/companies/membership", () => ({
    getCompanyMembership: getCompanyMembershipMock,
  }))
  mock.module("@/server/services/uploads/upload-image", () => ({
    uploadImageToS3: uploadImageToS3Mock,
  }))
  mock.module(
    "@/server/services/uploads/upload-company-verification-document",
    () => ({
      uploadCompanyVerificationDocument: uploadCompanyVerificationDocumentMock,
    }),
  )
  mock.module("@/server/storage/s3", () => ({
    uploadFile: mock(async () => "https://example.com/mock-upload.pdf"),
    deleteFile: deleteFileMock,
    getFile: mock(async () => Buffer.from("")),
    isConfigured: () => true,
  }))
  mock.module("@/server/services/notifications/emit", () => ({
    emitNotification: emitNotificationMock,
  }))
  mock.module("@/server/services/companies/trust-index", () => ({
    getCompanyTrustIndex: mock(async () => ({ score: 80 })),
    listCompanyTrustIndices: mock(async () => []),
  }))
  mock.module("@/server/services/companies/trust-actions", () => ({
    listCompanyReports: mock(async () => []),
    resolveCompanyReport: mock(async () => ({ success: true })),
    submitCompanyQualityFeedback: submitCompanyQualityFeedbackMock,
    submitCompanyReport: submitCompanyReportMock,
  }))
  mock.module("@/server/db", () => ({
    db: {
      select: () => ({
        from: () => ({
          where: async () => [],
          innerJoin: () => ({
            where: async () => [],
          }),
        }),
      }),
    },
  }))
}

describe("src/server/orpc/routes/companies", () => {
  let importCounter = 0

  async function importCompaniesRoute() {
    importCounter += 1
    return import(`@/server/orpc/routes/companies?test=${importCounter}`)
  }

  beforeEach(() => {
    applyCompaniesRouteMocks()
    listCompaniesMock.mockClear()
    listPublicDirectoryCompaniesMock.mockClear()
    createCompanyMock.mockClear()
    uploadCompanyVerificationDocumentMock.mockClear()
    deleteFileMock.mockClear()
    uploadImageToS3Mock.mockClear()
    downloadCompanyVerificationDocumentMock.mockClear()
    updateCompanyMock.mockClear()
    listCompanyMembersMock.mockClear()
    inviteCompanyMemberMock.mockClear()
    removeCompanyMemberMock.mockClear()
    deleteCompanyMock.mockClear()
    revalidateTagMock.mockClear()
    emitNotificationMock.mockClear()
    getCompanyMembershipMock.mockClear()
    submitCompanyQualityFeedbackMock.mockClear()
    submitCompanyReportMock.mockClear()
    isAdminRoleMock.mockClear()
  })

  afterAll(() => {
    mock.restore()
  })

  test("createCompanyProcedure revalidates onboarding and directory cache tags", async () => {
    const { createCompanyProcedure } = await importCompaniesRoute()
    const file = createPdfFile("trade-license.pdf")

    const result = await callProcedure(createCompanyProcedure, {
      input: { name: "Acme", wilayaCode: 16, verificationDocument: file },
      context: { user: { id: "user-1", role: "company_admin" } },
    })

    expect(result).toEqual({ companyId: "company-1" })
    expect(uploadCompanyVerificationDocumentMock).toHaveBeenCalledWith({
      file,
      userId: "user-1",
    })
    expect(createCompanyMock).toHaveBeenCalledWith(
      {
        name: "Acme",
        wilayaCode: 16,
        verificationDocument: {
          key: "company-verification/user-1/doc-1.pdf",
          fileName: "trade-license.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 1024,
        },
      },
      "user-1",
    )
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
    expect(revalidateTagMock).toHaveBeenCalledWith("company-company-1", "max")
    expect(revalidateTagMock).toHaveBeenCalledWith("company-user-user-1", "max")
    expect(revalidateTagMock).toHaveBeenCalledWith("companies-directory", {
      expire: 0,
    })
  })

  test("createCompanyProcedure maps membership conflicts", async () => {
    createCompanyMock.mockRejectedValueOnce(
      new ServiceError(
        "COMPANY_MEMBERSHIP_ALREADY_EXISTS",
        "Company admin is already assigned to a company",
      ),
    )

    const { createCompanyProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(createCompanyProcedure, {
        input: {
          name: "Acme",
          wilayaCode: 16,
          verificationDocument: createPdfFile("license.pdf"),
        },
        context: { user: { id: "user-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Company admin is already assigned to a company",
    })

    expect(deleteFileMock).toHaveBeenCalledWith(
      "company-verification/user-1/doc-1.pdf",
    )
  })

  test("createCompanyProcedure maps upload validation errors to BAD_REQUEST", async () => {
    uploadCompanyVerificationDocumentMock.mockRejectedValueOnce(
      new Error("Verification document must be a PDF, JPEG, or PNG file"),
    )

    const { createCompanyProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(createCompanyProcedure, {
        input: {
          name: "Acme",
          wilayaCode: 16,
          verificationDocument: createPdfFile("license.pdf"),
        },
        context: { user: { id: "user-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Verification document must be a PDF, JPEG, or PNG file",
    })

    expect(createCompanyMock).not.toHaveBeenCalled()
    expect(deleteFileMock).not.toHaveBeenCalled()
  })

  test("updateCompanyProcedure revalidates profile tags on success", async () => {
    const { updateCompanyProcedure } = await importCompaniesRoute()

    const result = await callProcedure(updateCompanyProcedure, {
      input: { description: "updated" },
      context: {
        user: { id: "user-1", role: "company_admin" },
        companyMembership: { companyId: "company-1", role: "owner" },
      },
    })

    expect(result).toEqual({ companyId: "company-1" })
    expect(updateCompanyMock).toHaveBeenCalledWith("company-1", {
      description: "updated",
    })
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })

  test("updateCompanyProcedure maps typed company errors", async () => {
    updateCompanyMock.mockRejectedValueOnce(
      new ServiceError("COMPANY_NOT_FOUND", "Company not found"),
    )
    const { updateCompanyProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(updateCompanyProcedure, {
        input: { description: "updated" },
        context: {
          user: { id: "user-1", role: "company_admin" },
          companyMembership: { companyId: "company-1", role: "owner" },
        },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Company not found",
    })
  })

  test("listCompaniesProcedure forwards search for super admins", async () => {
    listCompaniesMock.mockResolvedValueOnce({
      companies: [{ id: "company-1", name: "Acme" }],
      hasMore: false,
    })

    const { listCompaniesProcedure } = await importCompaniesRoute()

    const result = await callProcedure(listCompaniesProcedure, {
      input: { status: "pending", search: "acme", limit: 20, offset: 0 },
      context: { user: { id: "admin-1", role: "super_admin" } },
    })

    expect(listCompaniesMock).toHaveBeenCalledWith({
      status: "pending",
      search: "acme",
      limit: 20,
      offset: 0,
    })
    expect(result).toEqual({
      companies: [{ id: "company-1", name: "Acme" }],
      hasMore: false,
    })
  })

  test("listCompaniesProcedure strips search for non-super admin roles", async () => {
    const { listCompaniesProcedure } = await importCompaniesRoute()

    await callProcedure(listCompaniesProcedure, {
      input: { status: "pending", search: "acme", limit: 20, offset: 0 },
      context: { user: { id: "admin-2", role: "university_admin" } },
    })

    expect(listCompaniesMock).toHaveBeenCalledWith({
      status: "pending",
      search: undefined,
      limit: 20,
      offset: 0,
    })
  })

  test("listCompaniesProcedure keeps non-admin status forcing behavior", async () => {
    const { listCompaniesProcedure } = await importCompaniesRoute()

    await callProcedure(listCompaniesProcedure, {
      input: { status: "pending", search: "acme", limit: 20, offset: 0 },
      context: { user: { id: "student-1", role: "student" } },
    })

    expect(listCompaniesMock).toHaveBeenCalledWith({
      status: "approved",
      search: undefined,
      limit: 20,
      offset: 0,
    })
  })

  test("listCompaniesProcedure strips sensitive fields for non-admin users", async () => {
    listCompaniesMock.mockResolvedValueOnce({
      companies: [
        {
          id: "company-1",
          name: "Acme",
          slug: "acme",
          status: "approved",
          description: "Public profile",
          logoUrl: "https://example.com/logo.png",
          websiteUrl: "https://acme.test",
          wilayaCode: 16,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          phone: "+213555000000",
          contactEmail: "private@acme.test",
          representativeName: "Private Person",
          address: "Secret HQ",
          verificationDocumentKey: "secret-doc",
          rejectionReason: "internal",
        },
      ],
      hasMore: false,
    })

    const { listCompaniesProcedure } = await importCompaniesRoute()

    const result = await callProcedure(listCompaniesProcedure, {
      input: {},
      context: { user: { id: "student-1", role: "student" } },
    })

    expect(result).toEqual({
      companies: [
        {
          id: "company-1",
          name: "Acme",
          slug: "acme",
          status: "approved",
          description: "Public profile",
          logoUrl: "https://example.com/logo.png",
          websiteUrl: "https://acme.test",
          wilayaCode: 16,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
      hasMore: false,
    })
  })

  test("listPublicDirectoryProcedure delegates for students", async () => {
    listPublicDirectoryCompaniesMock.mockResolvedValueOnce({
      companies: [{ id: "company-1", name: "Acme" }],
      hasMore: false,
      nextCursor: undefined,
    })

    const { listPublicDirectoryProcedure } = await importCompaniesRoute()

    const result = await callProcedure(listPublicDirectoryProcedure, {
      input: { keyword: "acme", limit: 12 },
      context: { user: { id: "student-1", role: "student" } },
    })

    expect(listPublicDirectoryCompaniesMock).toHaveBeenCalledWith({
      keyword: "acme",
      limit: 12,
    })
    expect(result).toEqual({
      companies: [{ id: "company-1", name: "Acme" }],
      hasMore: false,
      nextCursor: undefined,
    })
  })

  test("listCompanyMembersProcedure delegates with company id", async () => {
    listCompanyMembersMock.mockResolvedValueOnce([
      {
        userId: "owner-1",
        email: "owner@example.com",
        name: "Owner",
        role: "owner",
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ])

    const { listCompanyMembersProcedure } = await importCompaniesRoute()

    const result = await callProcedure(listCompanyMembersProcedure, {
      context: {
        companyMembership: { companyId: "company-1", role: "owner" },
      },
    })

    expect(listCompanyMembersMock).toHaveBeenCalledWith("company-1")
    expect(result).toHaveLength(1)
  })

  test("inviteCompanyMemberProcedure maps member conflicts", async () => {
    inviteCompanyMemberMock.mockRejectedValueOnce(
      new ServiceError(
        "COMPANY_MEMBER_ALREADY_ASSIGNED",
        "User is already assigned to another company",
      ),
    )

    const { inviteCompanyMemberProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(inviteCompanyMemberProcedure, {
        input: { email: "member@example.com" },
        context: {
          user: { id: "owner-1" },
          companyMembership: { companyId: "company-1", role: "owner" },
        },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "User is already assigned to another company",
    })
  })

  test("removeCompanyMemberProcedure revalidates removed user cache tag", async () => {
    const { removeCompanyMemberProcedure } = await importCompaniesRoute()

    const result = await callProcedure(removeCompanyMemberProcedure, {
      input: { userId: "member-1" },
      context: {
        user: { id: "owner-1" },
        companyMembership: { companyId: "company-1", role: "owner" },
      },
    })

    expect(removeCompanyMemberMock).toHaveBeenCalledWith({
      companyId: "company-1",
      memberUserId: "member-1",
      removedByUserId: "owner-1",
    })
    expect(result).toEqual({ removed: true, userId: "member-1" })
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "company-user-member-1",
      "max",
    )
  })

  test("deleteCompanyProcedure hard-deletes company and revalidates caches", async () => {
    const { deleteCompanyProcedure } = await importCompaniesRoute()

    const result = await callProcedure(deleteCompanyProcedure, {
      input: { companyId: "company-1" },
      context: { user: { id: "super-admin-1", role: "super_admin" } },
    })

    expect(deleteCompanyMock).toHaveBeenCalledWith("company-1", "super-admin-1")
    expect(result).toEqual({
      success: true,
      companyId: "company-1",
      companyName: "ACME",
      affectedUsers: 2,
    })
    expect(revalidateTagMock).toHaveBeenCalledWith("company-company-1", "max")
    expect(revalidateTagMock).toHaveBeenCalledWith("company-offers-company-1", {
      expire: 0,
    })
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "company-candidates-company-1",
      { expire: 0 },
    )
    expect(revalidateTagMock).toHaveBeenCalledWith("offer-search", {
      expire: 0,
    })
    expect(revalidateTagMock).toHaveBeenCalledWith("offers-public", {
      expire: 0,
    })
    expect(revalidateTagMock).toHaveBeenCalledWith("companies-directory", {
      expire: 0,
    })
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "company-user-owner-1",
      "max",
    )
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "company-user-member-1",
      "max",
    )
  })

  test("deleteOwnCompanyProcedure deletes using owner membership company id", async () => {
    deleteCompanyMock.mockResolvedValueOnce({
      success: true,
      companyId: "company-owned",
      companyName: "Owned Co",
      affectedUserIds: ["owner-1"],
    })

    const { deleteOwnCompanyProcedure } = await importCompaniesRoute()

    const result = await callProcedure(deleteOwnCompanyProcedure, {
      input: {},
      context: {
        user: { id: "owner-1", role: "company_admin" },
        companyMembership: { companyId: "company-owned", role: "owner" },
      },
    })

    expect(deleteCompanyMock).toHaveBeenCalledWith("company-owned", "owner-1")
    expect(result).toEqual({
      success: true,
      companyId: "company-owned",
      companyName: "Owned Co",
      affectedUsers: 1,
    })
  })

  test("deleteCompanyProcedure maps company not found", async () => {
    deleteCompanyMock.mockRejectedValueOnce(
      new ServiceError("COMPANY_NOT_FOUND", "Company not found"),
    )

    const { deleteCompanyProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(deleteCompanyProcedure, {
        input: { companyId: "missing" },
        context: { user: { id: "super-admin-1", role: "super_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Company not found",
    })
  })

  test("downloadCompanyVerificationDocumentProcedure returns encoded document for super admin review", async () => {
    const { downloadCompanyVerificationDocumentProcedure } =
      await importCompaniesRoute()

    const result = await callProcedure(
      downloadCompanyVerificationDocumentProcedure,
      {
        input: { companyId: "company-1" },
        context: { user: { id: "super-admin-1", role: "super_admin" } },
      },
    )

    expect(downloadCompanyVerificationDocumentMock).toHaveBeenCalledWith(
      "company-1",
    )
    expect(result).toEqual({
      fileName: "trade-license.pdf",
      mimeType: "application/pdf",
      fileBase64: Buffer.from("verification-document").toString("base64"),
    })
  })

  test("downloadCompanyVerificationDocumentProcedure maps missing document errors", async () => {
    downloadCompanyVerificationDocumentMock.mockRejectedValueOnce(
      new ServiceError(
        "COMPANY_VERIFICATION_DOCUMENT_NOT_FOUND",
        "Company verification document not found",
      ),
    )

    const { downloadCompanyVerificationDocumentProcedure } =
      await importCompaniesRoute()

    await expect(
      callProcedure(downloadCompanyVerificationDocumentProcedure, {
        input: { companyId: "company-1" },
        context: { user: { id: "super-admin-1", role: "super_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Company verification document not found",
    })
  })

  test("submitCompanyReportProcedure blocks company admin self-reports", async () => {
    getCompanyMembershipMock.mockResolvedValueOnce({ companyId: "company-1" })

    const { submitCompanyReportProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(submitCompanyReportProcedure, {
        input: {
          companyId: "company-1",
          category: "harassment",
          severity: "high",
          description: "This report should be blocked by self-report guard.",
        },
        context: { user: { id: "admin-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Company admins cannot submit reports against their own company",
    })

    expect(submitCompanyReportMock).not.toHaveBeenCalled()
  })

  test("submitCompanyReportProcedure delegates for valid reporters", async () => {
    submitCompanyReportMock.mockResolvedValueOnce({ reportId: "report-1" })

    const { submitCompanyReportProcedure } = await importCompaniesRoute()

    const result = await callProcedure(submitCompanyReportProcedure, {
      input: {
        companyId: "company-9",
        category: "unsafe_conditions",
        severity: "medium",
        description: "The workspace conditions were not safe during the visit.",
      },
      context: { user: { id: "student-1", role: "student" } },
    })

    expect(result).toEqual({ reportId: "report-1" })
    expect(getCompanyMembershipMock).not.toHaveBeenCalled()
    expect(submitCompanyReportMock).toHaveBeenCalledWith({
      reporterUserId: "student-1",
      companyId: "company-9",
      category: "unsafe_conditions",
      severity: "medium",
      description: "The workspace conditions were not safe during the visit.",
    })
    expect(revalidateTagMock).toHaveBeenCalledWith("company-company-9", "max")
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "company-candidates-company-9",
      {
        expire: 0,
      },
    )
  })

  test("submitCompanyQualityFeedbackProcedure revalidates trust-related tags", async () => {
    submitCompanyQualityFeedbackMock.mockResolvedValueOnce({
      feedbackId: "feedback-1",
      companyId: "company-9",
    })

    const { submitCompanyQualityFeedbackProcedure } =
      await importCompaniesRoute()

    const result = await callProcedure(submitCompanyQualityFeedbackProcedure, {
      input: {
        placementId: "placement-1",
        rating: 4,
        wouldRecommend: true,
        comment: "Good mentorship and clear project scope.",
      },
      context: { user: { id: "student-1", role: "student" } },
    })

    expect(result).toEqual({ feedbackId: "feedback-1", companyId: "company-9" })
    expect(submitCompanyQualityFeedbackMock).toHaveBeenCalledWith({
      studentUserId: "student-1",
      placementId: "placement-1",
      rating: 4,
      wouldRecommend: true,
      comment: "Good mentorship and clear project scope.",
    })
    expect(revalidateTagMock).toHaveBeenCalledWith("company-company-9", "max")
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "company-candidates-company-9",
      {
        expire: 0,
      },
    )
  })

  test("submitCompanyReportProcedure maps relationship guard errors", async () => {
    submitCompanyReportMock.mockRejectedValueOnce(
      new ServiceError(
        "COMPANY_REPORT_RELATIONSHIP_REQUIRED",
        "You can only report companies you have applied to, worked with, or are a member of",
      ),
    )

    const { submitCompanyReportProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(submitCompanyReportProcedure, {
        input: {
          companyId: "company-9",
          category: "professional_conduct",
          severity: "medium",
          description:
            "The behavior described here should be blocked without relationship.",
        },
        context: { user: { id: "student-1", role: "student" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message:
        "You can only report companies you have applied to, worked with, or are a member of",
    })
  })
  test("updateCompanyProcedure rejects recruiter governance writes", async () => {
    const { updateCompanyProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(updateCompanyProcedure, {
        input: { description: "updated" },
        context: {
          user: { id: "recruiter-1", role: "company_admin" },
          companyMembership: { companyId: "company-1", role: "recruiter" },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Company owner access required",
    })
  })

  test("listCompanyMembersProcedure rejects recruiter governance reads", async () => {
    const { listCompanyMembersProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(listCompanyMembersProcedure, {
        context: {
          companyMembership: { companyId: "company-1", role: "recruiter" },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Company owner access required",
    })
  })

  test("uploadCompanyLogoProcedure rejects recruiter governance writes", async () => {
    const { uploadCompanyLogoProcedure } = await importCompaniesRoute()

    await expect(
      callProcedure(uploadCompanyLogoProcedure, {
        input: { file: createPdfFile("logo.png") },
        context: {
          user: { id: "recruiter-1", role: "company_admin" },
          companyMembership: { companyId: "company-1", role: "recruiter" },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Company owner access required",
    })
  })

  test("uploadCompanyLogoProcedure allows owner governance writes", async () => {
    const { uploadCompanyLogoProcedure } = await importCompaniesRoute()
    const file = createPdfFile("logo.png")

    const result = await callProcedure(uploadCompanyLogoProcedure, {
      input: { file },
      context: {
        user: { id: "owner-1", role: "company_admin" },
        companyMembership: { companyId: "company-1", role: "owner" },
      },
    })

    expect(result).toEqual({ url: "https://example.com/logo.png" })
    expect(uploadImageToS3Mock).toHaveBeenCalledWith({
      file,
      folder: "logos",
    })
    expect(updateCompanyMock).toHaveBeenCalledWith("company-1", {
      logoUrl: "https://example.com/logo.png",
    })
  })
})
