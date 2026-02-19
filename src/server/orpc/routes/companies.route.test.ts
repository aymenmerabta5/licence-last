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

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  companyOwnerProcedureStandard: createProcedureMock(),
  superAdminProcedureGenerous: createProcedureMock(),
  superAdminProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/orpc/middleware", () => ({
  isAdminRole: () => false,
}))

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: revalidateTagMock,
  revalidatePath: () => {},
  updateTag: () => {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unstable_cache: (fn: (...args: any[]) => any) => fn,
}))

mock.module("@/env", () => ({
  env: { NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000" },
}))

mock.module("@/server/services/companies/list", () => ({
  listCompanies: mock(async () => []),
}))
mock.module("@/server/services/companies/get", () => ({
  getCompanyById: mock(async () => null),
}))
mock.module("@/server/services/companies/create", () => ({
  createCompany: createCompanyMock,
}))
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
  uploadImageToS3: mock(async () => ({ url: "https://example.com/logo.png" })),
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
  submitCompanyQualityFeedback: mock(async () => ({ success: true })),
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

describe("src/server/orpc/routes/companies", () => {
  beforeEach(() => {
    createCompanyMock.mockClear()
    updateCompanyMock.mockClear()
    listCompanyMembersMock.mockClear()
    inviteCompanyMemberMock.mockClear()
    removeCompanyMemberMock.mockClear()
    revalidateTagMock.mockClear()
    emitNotificationMock.mockClear()
    getCompanyMembershipMock.mockClear()
    submitCompanyReportMock.mockClear()
  })

  afterAll(() => {
    mock.restore()
  })

  test("createCompanyProcedure maps membership conflicts", async () => {
    createCompanyMock.mockRejectedValueOnce(
      new ServiceError(
        "COMPANY_MEMBERSHIP_ALREADY_EXISTS",
        "Company admin is already assigned to a company",
      ),
    )

    const { createCompanyProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

    await expect(
      callProcedure(createCompanyProcedure, {
        input: { name: "Acme", wilayaCode: 16 },
        context: { user: { id: "user-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Company admin is already assigned to a company",
    })
  })

  test("updateCompanyProcedure revalidates profile tags on success", async () => {
    const { updateCompanyProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

    const result = await callProcedure(updateCompanyProcedure, {
      input: { description: "updated" },
      context: {
        user: { id: "user-1" },
        companyMembership: { companyId: "company-1" },
      },
    })

    expect(result).toEqual({ companyId: "company-1" })
    expect(updateCompanyMock).toHaveBeenCalledWith("company-1", {
      description: "updated",
    })
    expect(revalidateTagMock).toHaveBeenCalledTimes(2)
  })

  test("updateCompanyProcedure maps typed company errors", async () => {
    updateCompanyMock.mockRejectedValueOnce(
      new ServiceError("COMPANY_NOT_FOUND", "Company not found"),
    )
    const { updateCompanyProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

    await expect(
      callProcedure(updateCompanyProcedure, {
        input: { description: "updated" },
        context: {
          user: { id: "user-1" },
          companyMembership: { companyId: "company-1" },
        },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Company not found",
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

    const { listCompanyMembersProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

    const result = await callProcedure(listCompanyMembersProcedure, {
      context: { companyMembership: { companyId: "company-1" } },
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

    const { inviteCompanyMemberProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

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
    const { removeCompanyMemberProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

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

  test("submitCompanyReportProcedure blocks company admin self-reports", async () => {
    getCompanyMembershipMock.mockResolvedValueOnce({ companyId: "company-1" })

    const { submitCompanyReportProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

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

    const { submitCompanyReportProcedure } = await import(
      "@/server/orpc/routes/companies"
    )

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
  })
})
