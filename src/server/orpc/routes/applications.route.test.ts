import { beforeEach, describe, expect, mock, test } from "bun:test"

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

const applyToOfferMock = mock(async () => ({ applicationId: "app-1" }))
const withdrawApplicationMock = mock(async () => ({ applicationId: "app-1" }))
const listApplicationsByOfferMock = mock(async () => ({ applications: [] }))
const updatePipelineStageMock = mock(async () => ({ applicationId: "app-1" }))
const revalidateTagMock = mock(() => {})

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
  assistantProcedureLimited: createProcedureMock(),
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

mock.module("@/server/services/offers/search", () => ({
  searchOffers: mock(async () => ({ offers: [] })),
}))
mock.module("@/server/services/offers/get", () => ({
  getStudentApplicationForOffer: mock(async () => null),
}))
mock.module("@/server/services/applications/apply", () => ({
  applyToOffer: applyToOfferMock,
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
  listApplicationTimeline: mock(async () => ({ events: [] })),
  updateApplicationPipelineStage: updatePipelineStageMock,
}))
mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            limit: async () => [],
          }),
        }),
      }),
    }),
  },
}))
mock.module("@/server/orpc/middleware", () => ({
  isAdminRole: () => false,
}))

describe("src/server/orpc/routes/applications", () => {
  beforeEach(() => {
    applyToOfferMock.mockClear()
    withdrawApplicationMock.mockClear()
    listApplicationsByOfferMock.mockClear()
    updatePipelineStageMock.mockClear()
    revalidateTagMock.mockClear()
  })

  test("applyToOfferProcedure revalidates student tags", async () => {
    const { applyToOfferProcedure } = await import("@/server/orpc/routes/applications")

    const result = await callProcedure(applyToOfferProcedure, {
      input: { offerId: "offer-1", coverLetter: "hello" },
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({ applicationId: "app-1" })
    expect(applyToOfferMock).toHaveBeenCalledWith("offer-1", "user-1", "hello")
    expect(revalidateTagMock).toHaveBeenCalledTimes(2)
  })

  test("applyToOfferProcedure maps typed application errors", async () => {
    applyToOfferMock.mockRejectedValueOnce(
      new ApplicationServiceError("OFFER_FULL", "All positions have been filled"),
    )

    const { applyToOfferProcedure } = await import("@/server/orpc/routes/applications")

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

    const { applyToOfferProcedure } = await import("@/server/orpc/routes/applications")

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
      new ApplicationServiceError("APPLICATION_NOT_FOUND", "Application not found"),
    )

    const { withdrawApplicationProcedure } = await import("@/server/orpc/routes/applications")

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
      new ApplicationServiceError("OFFER_FORBIDDEN", "You do not have access to this offer"),
    )

    const { listByOfferProcedure } = await import("@/server/orpc/routes/applications")

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
      new ApplicationServiceError("APPLICATION_INVALID_STATE", "Invalid stage transition"),
    )

    const { updatePipelineStageProcedure } = await import("@/server/orpc/routes/applications")

    await expect(
      callProcedure(updatePipelineStageProcedure, {
        input: { applicationId: "app-1", toStage: "interview" },
        context: { user: { id: "user-1" }, companyMembership: { companyId: "company-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid stage transition",
    })
  })
})
