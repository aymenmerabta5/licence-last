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

const updateOfferMock = mock(async () => ({ offerId: "offer-1" }))
const deleteOfferMock = mock(async () => ({ offerId: "offer-1", deleted: true }))
const updateOfferStatusMock = mock(async () => ({ offerId: "offer-1", newStatus: "published" }))
const revalidateTagMock = mock(() => {})

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  authedProcedureStrict: createProcedureMock(),
  companyAdminProcedureAssistant: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
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

mock.module("@/server/services/offers/get", () => ({
  getOfferById: mock(async () => null),
}))
mock.module("@/server/services/offers/list-by-company", () => ({
  listOffersByCompany: mock(async () => []),
}))
mock.module("@/server/services/offers/create", () => ({
  createOffer: mock(async () => ({ offerId: "offer-1" })),
}))
mock.module("@/server/services/offers/update", () => ({
  updateOffer: updateOfferMock,
}))
mock.module("@/server/services/offers/delete", () => ({
  deleteOffer: deleteOfferMock,
}))
mock.module("@/server/services/offers/update-status", () => ({
  updateOfferStatus: updateOfferStatusMock,
}))
mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [],
        }),
      }),
    }),
  },
}))

describe("src/server/orpc/routes/offers", () => {
  beforeEach(() => {
    updateOfferMock.mockClear()
    deleteOfferMock.mockClear()
    updateOfferStatusMock.mockClear()
    revalidateTagMock.mockClear()
  })

  test("updateOfferProcedure revalidates caches on success", async () => {
    const { updateOfferProcedure } = await import("@/server/orpc/routes/offers")

    const result = await callProcedure(updateOfferProcedure, {
      input: { offerId: "offer-1", title: "Updated title" },
      context: { companyMembership: { companyId: "company-1" } },
    })

    expect(result).toEqual({ offerId: "offer-1" })
    expect(updateOfferMock).toHaveBeenCalledWith(
      "offer-1",
      "company-1",
      { title: "Updated title" },
    )
    expect(revalidateTagMock).toHaveBeenCalledTimes(4)
  })

  test("updateOfferProcedure maps typed service errors", async () => {
    updateOfferMock.mockRejectedValueOnce(
      new ServiceError("OFFER_CLOSED", "Cannot update a closed offer"),
    )

    const { updateOfferProcedure } = await import("@/server/orpc/routes/offers")

    await expect(
      callProcedure(updateOfferProcedure, {
        input: { offerId: "offer-1" },
        context: { companyMembership: { companyId: "company-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Cannot update a closed offer",
    })
  })

  test("deleteOfferProcedure maps not-found service errors", async () => {
    deleteOfferMock.mockRejectedValueOnce(
      new ServiceError("OFFER_NOT_FOUND", "Offer not found or access denied"),
    )
    const { deleteOfferProcedure } = await import("@/server/orpc/routes/offers")

    await expect(
      callProcedure(deleteOfferProcedure, {
        input: { offerId: "offer-1" },
        context: { companyMembership: { companyId: "company-1" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    })
  })
})
