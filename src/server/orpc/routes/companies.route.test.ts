import { beforeEach, describe, expect, mock, test } from "bun:test"

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

const updateCompanyMock = mock(async () => ({ companyId: "company-1" }))
const revalidateTagMock = mock(() => {})

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
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
  createCompany: mock(async () => ({ companyId: "company-1" })),
}))
mock.module("@/server/services/companies/update", () => ({
  updateCompany: updateCompanyMock,
}))
mock.module("@/server/services/companies/approve", () => ({
  approveCompany: mock(async () => ({ name: "ACME" })),
}))
mock.module("@/server/services/companies/reject", () => ({
  rejectCompany: mock(async () => ({ name: "ACME" })),
}))
mock.module("@/server/services/companies/membership", () => ({
  getCompanyMembership: mock(async () => null),
}))
mock.module("@/server/services/uploads/upload-image", () => ({
  uploadImageToS3: mock(async () => ({ url: "https://example.com/logo.png" })),
}))
mock.module("@/server/services/notifications/create", () => ({
  createNotification: mock(async () => ({ success: true })),
}))
mock.module("@/server/email/sendEmail", () => ({
  sendEmail: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/companies/trust-index", () => ({
  getCompanyTrustIndex: mock(async () => ({ score: 80 })),
  listCompanyTrustIndices: mock(async () => []),
}))
mock.module("@/server/services/companies/trust-actions", () => ({
  listCompanyReports: mock(async () => []),
  resolveCompanyReport: mock(async () => ({ success: true })),
  submitCompanyQualityFeedback: mock(async () => ({ success: true })),
  submitCompanyReport: mock(async () => ({ success: true })),
}))
mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: async () => [],
        }),
      }),
    }),
  },
}))

describe("src/server/orpc/routes/companies", () => {
  beforeEach(() => {
    updateCompanyMock.mockClear()
    revalidateTagMock.mockClear()
  })

  test("updateCompanyProcedure revalidates profile tags on success", async () => {
    const { updateCompanyProcedure } = await import("./companies")

    const result = await callProcedure(updateCompanyProcedure, {
      input: { description: "updated" },
      context: {
        user: { id: "user-1" },
        companyMembership: { companyId: "company-1" },
      },
    })

    expect(result).toEqual({ companyId: "company-1" })
    expect(updateCompanyMock).toHaveBeenCalledWith("company-1", { description: "updated" })
    expect(revalidateTagMock).toHaveBeenCalledTimes(2)
  })

  test("updateCompanyProcedure maps typed company errors", async () => {
    updateCompanyMock.mockRejectedValueOnce(
      new ServiceError("COMPANY_NOT_FOUND", "Company not found"),
    )
    const { updateCompanyProcedure } = await import("./companies")

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
})
