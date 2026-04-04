import { describe, expect, mock, test } from "bun:test"

let importCounter = 0
let publicProfileModuleLoads = 0
let studentCvModuleLoads = 0
let universityModuleLoads = 0
let dashboardStatsModuleLoads = 0
let dbModuleLoads = 0

const requireRoleMock = mock(async () => ({
  id: "admin-1",
  role: "university_admin",
  universityId: "uni-1",
  departmentId: "dept-1",
  universityMembershipRole: null,
}))

mock.module("@/lib/auth-guards", () => ({
  requireRole: requireRoleMock,
}))

mock.module("@/server/services/students/get-public-profile", () => {
  publicProfileModuleLoads += 1

  return {
    getPublicStudentProfile: mock(async () => null),
  }
})

mock.module("@/server/services/students/get-cv", () => {
  studentCvModuleLoads += 1

  return {
    getStudentCv: mock(async () => null),
  }
})

mock.module("@/server/services/universities/get", () => {
  universityModuleLoads += 1

  return {
    getUniversityById: mock(async () => null),
  }
})

mock.module("@/server/services/students/get-dashboard-stats", () => {
  dashboardStatsModuleLoads += 1

  return {
    getStudentDashboardStats: mock(async () => null),
  }
})

mock.module("@/server/db", () => {
  dbModuleLoads += 1

  return {
    db: {},
  }
})

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent",
  () => ({
    ProfileContent: () => null,
  }),
)

async function loadModule() {
  importCounter += 1
  return import(
    `@/app/[locale]/profile/[userId]/_components/ProfileData?imports-test=${importCounter}`
  )
}

describe("src/app/[locale]/profile/[userId]/_components/ProfileData imports", () => {
  test("does not load DB-backed modules during import", async () => {
    await loadModule()

    expect(dbModuleLoads).toBe(0)
    expect(publicProfileModuleLoads).toBe(0)
    expect(studentCvModuleLoads).toBe(0)
    expect(universityModuleLoads).toBe(0)
    expect(dashboardStatsModuleLoads).toBe(0)
  })
})
