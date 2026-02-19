import { beforeEach, describe, expect, mock, test } from "bun:test"

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

const getAdminStatsMock = mock(async () => ({ totalUsers: 10 }))
const getUniversityDashboardStatsMock = mock(async () => ({ accepted: 5 }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  adminProcedureGenerous: createProcedureMock(),
  superAdminProcedureGenerous: createProcedureMock(),
}))

mock.module("@/server/services/stats/get-admin-stats", () => ({
  getAdminStats: getAdminStatsMock,
}))
mock.module("@/server/services/stats/get-university-dashboard-stats", () => ({
  getUniversityDashboardStats: getUniversityDashboardStatsMock,
}))

describe("src/server/orpc/routes/stats", () => {
  beforeEach(() => {
    getAdminStatsMock.mockClear()
    getUniversityDashboardStatsMock.mockClear()
  })

  test("getAdminStatsProcedure delegates to service", async () => {
    const { getAdminStatsProcedure } = await import(
      "@/server/orpc/routes/stats"
    )

    const result = await callProcedure(getAdminStatsProcedure, { context: {} })

    expect(result).toEqual({ totalUsers: 10 })
    expect(getAdminStatsMock).toHaveBeenCalledTimes(1)
  })

  test("getUniversityDashboardStatsProcedure rejects non-university admins", async () => {
    const { getUniversityDashboardStatsProcedure } = await import(
      "@/server/orpc/routes/stats"
    )

    await expect(
      callProcedure(getUniversityDashboardStatsProcedure, {
        context: {
          user: { role: "company_admin", universityId: "uni-1" },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "University admin access required",
    })
  })

  test("getUniversityDashboardStatsProcedure delegates with university id", async () => {
    const { getUniversityDashboardStatsProcedure } = await import(
      "@/server/orpc/routes/stats"
    )

    const result = await callProcedure(getUniversityDashboardStatsProcedure, {
      context: {
        user: { role: "university_admin", universityId: "uni-1" },
      },
    })

    expect(result).toEqual({ accepted: 5 })
    expect(getUniversityDashboardStatsMock).toHaveBeenCalledWith("uni-1")
  })
})
