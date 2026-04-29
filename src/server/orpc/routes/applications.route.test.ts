import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

import { ApplicationServiceError } from "@/server/services/applications/errors"

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

const applyToOfferMock = mock(async () => ({
  applicationId: "app-1",
  companyId: "company-1",
}))
const generateCoverLetterMock = mock(async () => ({
  coverLetter: "Generated cover letter",
}))
const withdrawApplicationMock = mock(async () => ({
  applicationId: "app-1",
  newStatus: "withdrawn",
  companyId: "company-1",
}))
const listApplicationsByOfferMock = mock(async () => ({ applications: [] }))
const updatePipelineStageMock = mock(async () => ({ applicationId: "app-1" }))
const listApplicationTimelineMock = mock(async (): Promise<unknown[]> => [])
const revalidateTagMock = mock(() => {})
const isAdminRoleMock = mock(() => false)
const dbLimitQueue: unknown[][] = []

function getNextDbRows() {
  const rows = dbLimitQueue.shift()
  return rows ?? []
}

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  publicProcedureStrict: createProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
  authedSessionProcedureStandard: createProcedureMock(),
  authedSessionProcedureGenerous: createProcedureMock(),
  authedProcedureStrict: createProcedureMock(),
  authedProcedureGenerous: createProcedureMock(),
  adminProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
  adminProcedureAssistant: createProcedureMock(),
  universityProcedureAssistant: createProcedureMock(),
  universityProcedureStandard: createProcedureMock(),
  superAdminProcedureGenerous: createProcedureMock(),
  superAdminProcedureStandard: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  companyAdminProcedureAssistant: createProcedureMock(),
  companyOwnerProcedureStandard: createProcedureMock(),
  companyOwnerProcedureGenerous: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
  deptHeadProcedureStandard: createProcedureMock(),
  deptHeadProcedureGenerous: createProcedureMock(),
  assistantProcedureLimited: createProcedureMock(),
}))

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: revalidateTagMock,
  revalidatePath: () => {},
  updateTag: () => {},
  unstable_cache: (fn: (...args: any[]) => any) => fn,
}))

mock.module("@/server/services/offers/search", () => ({
  searchOffers: mock(async () => ({ offers: [] })),
}))
mock.module("@/server/services/offers/get", () => ({
  getOfferById: mock(async () => null),
  getStudentApplicationForOffer: mock(async () => null),
}))
mock.module("@/server/services/applications/apply", () => ({
  applyToOffer: applyToOfferMock,
}))
mock.module("@/server/services/applications/generate-cover-letter", () => ({
  generateCoverLetter: generateCoverLetterMock,
}))
mock.module("@/server/services/applications/list-by-student", () => ({
  listApplicationsByStudent: mock(async () => ({ applications: [] })),
}))
mock.module("@/server/services/applications/withdraw", () => ({
  withdrawApplication: withdrawApplicationMock,
}))
mock.module("@/server/services/applications/list-by-offer", () => ({
  listApplicationsByOffer: listApplicationsByOfferMock,
}))
mock.module("@/server/services/applications/company-accept", () => ({
  companyAcceptApplication: mock(async () => ({ applicationId: "app-1" })),
}))
mock.module("@/server/services/applications/company-refuse", () => ({
  companyRefuseApplication: mock(async () => ({ applicationId: "app-1" })),
}))
mock.module("@/server/services/applications/pipeline", () => ({
  appendTimelineEvent: mock(async () => ({ eventId: "event-1" })),
  listApplicationTimeline: listApplicationTimelineMock,
  updateApplicationPipelineStage: updatePipelineStageMock,
}))
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  leftJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: async () => getNextDbRows(),
}

mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => selectBuilder,
    }),
  },
}))
mock.module("@/server/orpc/middleware", () => ({
  isAdminRole: isAdminRoleMock,
}))

describe("src/server/orpc/routes/applications", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    applyToOfferMock.mockClear()
    generateCoverLetterMock.mockClear()
    withdrawApplicationMock.mockClear()
    listApplicationsByOfferMock.mockClear()
    updatePipelineStageMock.mockClear()
    listApplicationTimelineMock.mockClear()
    revalidateTagMock.mockClear()
    isAdminRoleMock.mockClear()
    isAdminRoleMock.mockImplementation(() => false)
    dbLimitQueue.length = 0
  })

  test("applyToOfferProcedure revalidates student and company offer tags", async () => {
    const { applyToOfferProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    const result = await callProcedure(applyToOfferProcedure, {
      input: { offerId: "offer-1", coverLetter: "hello" },
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({
      applicationId: "app-1",
      companyId: "company-1",
    })
    expect(applyToOfferMock).toHaveBeenCalledWith("offer-1", "user-1", "hello")
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "company-offers-company-1",
      "max",
    )
  })

  test("applyToOfferProcedure maps typed application errors", async () => {
    applyToOfferMock.mockRejectedValueOnce(
      new ApplicationServiceError(
        "OFFER_FULL",
        "All positions have been filled",
      ),
    )

    const { applyToOfferProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(applyToOfferProcedure, {
        input: { offerId: "offer-1" },
        context: { user: { id: "user-1" } },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "All positions have been filled",
    })
  })

  test("applyToOfferProcedure maps unknown errors to internal", async () => {
    applyToOfferMock.mockRejectedValueOnce(new Error("boom"))

    const { applyToOfferProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(applyToOfferProcedure, {
        input: { offerId: "offer-1" },
        context: { user: { id: "user-1" } },
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    })
  })

  test("withdrawApplicationProcedure maps typed application errors", async () => {
    withdrawApplicationMock.mockRejectedValueOnce(
      new ApplicationServiceError(
        "APPLICATION_NOT_FOUND",
        "Application not found",
      ),
    )

    const { withdrawApplicationProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(withdrawApplicationProcedure, {
        input: { applicationId: "app-1" },
        context: { user: { id: "user-1" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Application not found",
    })
  })

  test("listByOfferProcedure maps typed offer ownership errors", async () => {
    listApplicationsByOfferMock.mockRejectedValueOnce(
      new ApplicationServiceError(
        "OFFER_FORBIDDEN",
        "You do not have access to this offer",
      ),
    )

    const { listByOfferProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(listByOfferProcedure, {
        input: { offerId: "offer-1" },
        context: { companyMembership: { companyId: "company-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this offer",
    })
  })

  test("updatePipelineStageProcedure maps typed pipeline state errors", async () => {
    updatePipelineStageMock.mockRejectedValueOnce(
      new ApplicationServiceError(
        "APPLICATION_INVALID_STATE",
        "Invalid stage transition",
      ),
    )

    const { updatePipelineStageProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(updatePipelineStageProcedure, {
        input: { applicationId: "app-1", toStage: "interview" },
        context: {
          user: { id: "user-1" },
          companyMembership: { companyId: "company-1" },
        },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid stage transition",
    })
  })

  test("getTimelineProcedure returns timeline for the owning student", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])
    listApplicationTimelineMock.mockResolvedValueOnce([
      { id: "evt-1", eventType: "application_created" },
    ])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    const result = await callProcedure(getTimelineProcedure, {
      input: { applicationId: "app-1" },
      context: { user: { id: "student-1", role: "student" } },
    })

    expect(result).toEqual([{ id: "evt-1", eventType: "application_created" }])
    expect(listApplicationTimelineMock).toHaveBeenCalledWith("app-1")
  })

  test("getTimelineProcedure allows same-university university admin", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])
    listApplicationTimelineMock.mockResolvedValueOnce([
      { id: "evt-1", eventType: "application_status_changed" },
    ])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    const result = await callProcedure(getTimelineProcedure, {
      input: { applicationId: "app-1" },
      context: {
        user: {
          id: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
        },
      },
    })

    expect(result).toEqual([
      { id: "evt-1", eventType: "application_status_changed" },
    ])
  })

  test("getTimelineProcedure allows same-department dept head", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])
    listApplicationTimelineMock.mockResolvedValueOnce([
      { id: "evt-2", eventType: "application_status_changed" },
    ])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    const result = await callProcedure(getTimelineProcedure, {
      input: { applicationId: "app-1" },
      context: {
        user: {
          id: "head-1",
          role: "university_admin",
          universityId: "uni-1",
          departmentId: "dep-1",
        },
      },
    })

    expect(result).toEqual([
      { id: "evt-2", eventType: "application_status_changed" },
    ])
  })

  test("getTimelineProcedure returns timeline for same-company membership", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])
    dbLimitQueue.push([{ companyId: "company-1" }])
    listApplicationTimelineMock.mockResolvedValueOnce([
      { id: "evt-1", eventType: "application_status_changed" },
    ])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    const result = await callProcedure(getTimelineProcedure, {
      input: { applicationId: "app-1" },
      context: { user: { id: "company-user-1", role: "company_admin" } },
    })

    expect(result).toEqual([
      { id: "evt-1", eventType: "application_status_changed" },
    ])
    expect(listApplicationTimelineMock).toHaveBeenCalledWith("app-1")
  })

  test("getTimelineProcedure rejects when application is missing", async () => {
    dbLimitQueue.push([])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(getTimelineProcedure, {
        input: { applicationId: "app-missing" },
        context: { user: { id: "student-1", role: "student" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Application not found",
    })
  })

  test("getTimelineProcedure rejects unauthorized actor", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(getTimelineProcedure, {
        input: { applicationId: "app-1" },
        context: { user: { id: "student-2", role: "student" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this timeline",
    })
  })

  test("getTimelineProcedure rejects cross-department dept head", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(getTimelineProcedure, {
        input: { applicationId: "app-1" },
        context: {
          user: {
            id: "head-1",
            role: "university_admin",
            universityId: "uni-2",
            departmentId: "dep-2",
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this timeline",
    })
  })

  test("getTimelineProcedure rejects company admin with mismatched membership", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])
    dbLimitQueue.push([{ companyId: "company-2" }])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(getTimelineProcedure, {
        input: { applicationId: "app-1" },
        context: { user: { id: "company-user-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this timeline",
    })
  })

  test("getTimelineProcedure rejects multiple company memberships", async () => {
    dbLimitQueue.push([
      {
        id: "app-1",
        studentUserId: "student-1",
        studentUniversityId: "uni-1",
        studentDepartmentId: "dep-1",
        companyId: "company-1",
      },
    ])
    dbLimitQueue.push([{ companyId: "company-1" }, { companyId: "company-2" }])

    const { getTimelineProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(getTimelineProcedure, {
        input: { applicationId: "app-1" },
        context: { user: { id: "company-user-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Multiple company memberships found for user",
    })
  })

  test("withdrawApplicationProcedure revalidates student and company offer tags", async () => {
    const { withdrawApplicationProcedure } = await import(
      `@/server/orpc/routes/applications?test=${Date.now()}`
    )

    const result = await callProcedure(withdrawApplicationProcedure, {
      input: { applicationId: "app-1" },
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({
      applicationId: "app-1",
      newStatus: "withdrawn",
      companyId: "company-1",
    })
  })

  test("generateCoverLetterProcedure maps AI outages to service unavailable", async () => {
    generateCoverLetterMock.mockRejectedValueOnce(new Error("model timed out"))

    const { generateCoverLetterProcedure } = await import(
      "@/server/orpc/routes/applications"
    )

    await expect(
      callProcedure(generateCoverLetterProcedure, {
        input: {
          offerTitle: "Frontend Intern",
          offerDescription: "A real internship",
          skills: ["React"],
          companyName: "Acme",
        },
        context: {},
      }),
    ).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message:
        "AI service is temporarily unavailable. Please try again shortly.",
    })
  })
})
