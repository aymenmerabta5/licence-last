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
const deleteOfferMock = mock(async () => ({
  offerId: "offer-1",
  deleted: true,
}))
const listSavedOffersMock = mock(async () => ({ offers: [], hasMore: false }))
const checkOfferSavedMock = mock(async () => ({ saved: false }))
const saveOfferMock = mock(async () => ({ saved: true }))
const unsaveOfferMock = mock(async () => ({ saved: false }))
const revalidateTagMock = mock(() => {})
const featureFlagsState = {
  NOTIF_PREFERENCES: true,
  SAVED_OFFERS: true,
  INTERVIEWS: true,
  LANGUAGE_REQUIREMENTS: true,
}
const isFeatureEnabledMock = mock(
  (flag: keyof typeof featureFlagsState) => featureFlagsState[flag],
)

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
  superAdminProcedureGenerous: createProcedureMock(),
  superAdminProcedureStandard: createProcedureMock(),
  assistantProcedureLimited: createProcedureMock(),
  companyAdminProcedureAssistant: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
  deptHeadProcedureStandard: createProcedureMock(),
  deptHeadProcedureGenerous: createProcedureMock(),
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
mock.module("@/server/services/offers/list-saved", () => ({
  listSavedOffers: listSavedOffersMock,
}))
mock.module("@/server/services/offers/check-saved", () => ({
  checkOfferSaved: checkOfferSavedMock,
}))
mock.module("@/server/services/offers/save", () => ({
  saveOffer: saveOfferMock,
}))
mock.module("@/server/services/offers/unsave", () => ({
  unsaveOffer: unsaveOfferMock,
}))
mock.module("@/lib/feature-flags", () => ({
  FEATURE_FLAGS: featureFlagsState,
  isFeatureEnabled: isFeatureEnabledMock,
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
    listSavedOffersMock.mockClear()
    checkOfferSavedMock.mockClear()
    saveOfferMock.mockClear()
    unsaveOfferMock.mockClear()
    revalidateTagMock.mockClear()
    isFeatureEnabledMock.mockClear()
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => featureFlagsState[flag],
    )
  })

  test("updateOfferProcedure revalidates caches on success", async () => {
    const { updateOfferProcedure } = await import("@/server/orpc/routes/offers")

    const result = await callProcedure(updateOfferProcedure, {
      input: { offerId: "offer-1", title: "Updated title" },
      context: { companyMembership: { companyId: "company-1" } },
    })

    expect(result).toEqual({ offerId: "offer-1" })
    expect(updateOfferMock).toHaveBeenCalledWith("offer-1", "company-1", {
      title: "Updated title",
    })
    expect(revalidateTagMock).toHaveBeenCalledTimes(5)
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

  test("listSavedOffersProcedure delegates with user and input", async () => {
    const { listSavedOffersProcedure } = await import(
      "@/server/orpc/routes/offers"
    )

    const input = { limit: 10 }
    const result = await callProcedure(listSavedOffersProcedure, {
      input,
      context: { user: { id: "student-1" } },
    })

    expect(result).toEqual({ offers: [], hasMore: false })
    expect(isFeatureEnabledMock).toHaveBeenCalledWith("SAVED_OFFERS")
    expect(listSavedOffersMock).toHaveBeenCalledWith("student-1", input)
  })

  test("saveOfferProcedure rejects when saved offers feature is disabled", async () => {
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => {
        if (flag === "SAVED_OFFERS") return false
        return featureFlagsState[flag]
      },
    )

    const { saveOfferProcedure } = await import("@/server/orpc/routes/offers")

    await expect(
      callProcedure(saveOfferProcedure, {
        input: { offerId: "offer-1" },
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Saved offers feature is disabled",
    })
  })

  test("createOfferProcedure requires language requirements when feature is enabled", async () => {
    const { createOfferProcedure } = await import("@/server/orpc/routes/offers")

    await expect(
      callProcedure(createOfferProcedure, {
        input: {
          title: "Frontend intern",
          description: "A long enough description for validation",
          internshipType: "pfe",
          skillTagIds: [],
        },
        context: { companyMembership: { companyId: "company-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "At least one language requirement is required",
    })
  })
})
