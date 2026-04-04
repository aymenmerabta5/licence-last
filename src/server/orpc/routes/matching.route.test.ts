import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

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

const getOfferAccessContextMock = mock(async () => ({
  companyId: "company-1",
  status: "published",
}))
const canAccessMatchScoreMock = mock(async () => true)
const getExplainableMatchScoreMock = mock(async () => ({ score: 82 }))
const captureReadinessSnapshotMock = mock(async () => ({ success: true }))
const dbLimitQueue: unknown[][] = []

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  universityProcedureAssistant: createProcedureMock(),
  authedProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/matching/score", () => ({
  canAccessMatchScore: canAccessMatchScoreMock,
  getExplainableMatchScore: getExplainableMatchScoreMock,
  getOfferAccessContext: getOfferAccessContextMock,
}))
mock.module("@/server/services/matching/skill-gap", () => ({
  getSkillGapRoadmap: mock(async () => ({ missing: [] })),
}))
mock.module("@/server/services/matching/readiness-history", () => ({
  captureReadinessSnapshot: captureReadinessSnapshotMock,
  listReadinessHistory: mock(async () => []),
}))
mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => dbLimitQueue.shift() ?? [],
        }),
      }),
    }),
  },
}))
mock.module("@/server/db/schema/companies", () => ({
  company: {
    id: "company-id-column",
  },
  companyMember: {
    companyId: "company-id-column",
    userId: "user-id-column",
  },
}))

describe("src/server/orpc/routes/matching", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    getOfferAccessContextMock.mockClear()
    canAccessMatchScoreMock.mockClear()
    getExplainableMatchScoreMock.mockClear()
    captureReadinessSnapshotMock.mockClear()
    dbLimitQueue.length = 0
  })

  test("getScoreProcedure delegates after access check", async () => {
    const { getScoreProcedure } = await import("@/server/orpc/routes/matching")

    const result = await callProcedure(getScoreProcedure, {
      input: { studentUserId: "student-1", offerId: "offer-1" },
      context: { user: { id: "viewer-1", role: "student" } },
    })

    expect(result).toEqual({ score: 82 })
    expect(getExplainableMatchScoreMock).toHaveBeenCalledWith(
      "student-1",
      "offer-1",
    )
  })

  test("getScoreProcedure throws FORBIDDEN when access check fails", async () => {
    canAccessMatchScoreMock.mockResolvedValueOnce(false)
    const { getScoreProcedure } = await import("@/server/orpc/routes/matching")

    await expect(
      callProcedure(getScoreProcedure, {
        input: { studentUserId: "student-1", offerId: "offer-1" },
        context: { user: { id: "viewer-1", role: "student" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this match score",
    })
  })

  test("getScoreProcedure denies company admins without an application relationship", async () => {
    dbLimitQueue.push([{ companyId: "company-1" }], [])
    canAccessMatchScoreMock.mockResolvedValueOnce(false)

    const { getScoreProcedure } = await import("@/server/orpc/routes/matching")

    await expect(
      callProcedure(getScoreProcedure, {
        input: { studentUserId: "student-1", offerId: "offer-1" },
        context: { user: { id: "company-admin-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this match score",
    })

    expect(canAccessMatchScoreMock).toHaveBeenCalledWith(
      { id: "company-admin-1", role: "company_admin" },
      {
        studentUserId: "student-1",
        offerCompanyId: "company-1",
        isOfferVisibleToStudent: true,
        viewerCompanyId: "company-1",
        hasApplicationRelationship: false,
      },
    )
  })

  test("captureReadinessSnapshotProcedure delegates to readiness service", async () => {
    const { captureReadinessSnapshotProcedure } = await import(
      "@/server/orpc/routes/matching"
    )

    const result = await callProcedure(captureReadinessSnapshotProcedure, {
      input: { offerId: "offer-1", source: "manual" },
      context: { user: { id: "student-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(captureReadinessSnapshotMock).toHaveBeenCalledWith(
      "student-1",
      "offer-1",
      "manual",
      { actor: "student" },
    )
  })
})
