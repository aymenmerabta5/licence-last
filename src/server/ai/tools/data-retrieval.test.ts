import { beforeEach, describe, expect, mock, test } from "bun:test"

const getUniversityDashboardStatsMock = mock(async () => ({ accepted: 5 }))
const listPendingApplicationsMock = mock(async () => ({
  applications: [],
  hasMore: false,
}))

mock.module("ai", () => ({
  tool: <T>(definition: T) => definition,
}))

mock.module("@/server/ai/tools/utils", () => ({
  fuzzyMatchOffer: () => null,
  redactForAssistant: <T>(value: T) => value,
}))

mock.module("@/server/services/applications/list-by-offer", () => ({
  listApplicationsByOffer: mock(async () => ({
    applications: [],
    hasMore: false,
  })),
}))

mock.module("@/server/services/companies/trust-index", () => ({
  getCompanyTrustIndex: mock(async () => ({ score: 80 })),
  listCompanyTrustIndices: mock(async () => []),
}))

mock.module("@/server/services/offers/list-by-company", () => ({
  listOffersByCompany: mock(async () => []),
}))

mock.module("@/server/services/placements/list-pending", () => ({
  listPendingApplications: listPendingApplicationsMock,
}))

mock.module("@/server/services/stats/get-admin-stats", () => ({
  getAdminStats: mock(async () => ({ totalUsers: 10 })),
}))

mock.module("@/server/services/stats/get-university-dashboard-stats", () => ({
  getUniversityDashboardStats: getUniversityDashboardStatsMock,
}))

describe("src/server/ai/tools/data-retrieval", () => {
  beforeEach(() => {
    getUniversityDashboardStatsMock.mockClear()
    listPendingApplicationsMock.mockClear()
  })

  test("does not expose university-wide stats to department heads", async () => {
    const { createDataRetrievalTools } = await import(
      "@/server/ai/tools/data-retrieval?test=dept-head" as string
    )

    const tools = createDataRetrievalTools({
      userId: "user-1",
      role: "university_admin",
      companyId: null,
      universityId: "uni-1",
      departmentId: "dept-1",
      universityMembershipRole: "department_head",
    })

    expect(tools.get_platform_stats).toBeUndefined()
    expect(tools.get_pending_placements).toBeDefined()

    await tools.get_pending_placements.execute({})

    expect(listPendingApplicationsMock).toHaveBeenCalledWith(
      { limit: 20 },
      {
        role: "department_head",
        universityId: "uni-1",
        departmentId: "dept-1",
      },
    )
  })

  test("keeps university-wide stats for full university admins", async () => {
    const { createDataRetrievalTools } = await import(
      "@/server/ai/tools/data-retrieval?test=university-admin" as string
    )

    const tools = createDataRetrievalTools({
      userId: "user-2",
      role: "university_admin",
      companyId: null,
      universityId: "uni-1",
      departmentId: null,
      universityMembershipRole: null,
    })

    expect(tools.get_platform_stats).toBeDefined()

    const result = await tools.get_platform_stats.execute({})

    expect(getUniversityDashboardStatsMock).toHaveBeenCalledWith("uni-1")
    expect(result).toEqual({ accepted: 5 })
  })
})
