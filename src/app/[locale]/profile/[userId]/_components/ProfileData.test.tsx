import { beforeEach, describe, expect, mock, test } from "bun:test"

const requireRoleMock = mock(async () => ({
  id: "admin-1",
  role: "university_admin",
  universityId: "uni-1",
  departmentId: "dept-1",
  universityMembershipRole: null,
}))

const getPublicStudentProfileMock = mock(async () => ({
  user: {
    id: "student-1",
    name: "Student One",
    email: null,
    role: "student",
    image: null,
    universityId: "uni-1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  profile: {
    bio: "Hello",
    phone: null,
    wilayaCode: 16,
    githubUrl: null,
    portfolioUrl: null,
    studentNumber: null,
    department: "CS",
    level: "L3",
    address: null,
  },
  skills: [],
  languages: [],
}))

const getStudentCvMock = mock(async () => ({
  experiences: [{ id: "exp-1", title: "Intern", organization: "Acme" }],
}))

const getUniversityByIdMock = mock(async () => null)
const getStudentDashboardStatsMock = mock(async () => null)

let importCounter = 0

mock.module("@/lib/auth-guards", () => ({
  requireRole: requireRoleMock,
}))

mock.module("@/server/services/students/get-public-profile", () => ({
  getPublicStudentProfile: getPublicStudentProfileMock,
}))

mock.module("@/server/services/students/get-cv", () => ({
  getStudentCv: getStudentCvMock,
}))

mock.module("@/server/services/universities/get", () => ({
  getUniversityById: getUniversityByIdMock,
}))

mock.module("@/server/services/students/get-dashboard-stats", () => ({
  getStudentDashboardStats: getStudentDashboardStatsMock,
}))

mock.module("@/server/db", () => ({
  db: {},
}))

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent",
  () => ({
    ProfileContent: () => null,
  }),
)

async function loadModule() {
  importCounter += 1
  return import(
    `@/app/[locale]/profile/[userId]/_components/ProfileData?test=${importCounter}`
  )
}

describe("src/app/[locale]/profile/[userId]/_components/ProfileData", () => {
  beforeEach(() => {
    requireRoleMock.mockClear()
    getPublicStudentProfileMock.mockClear()
    getStudentCvMock.mockClear()
    getUniversityByIdMock.mockClear()
    getStudentDashboardStatsMock.mockClear()
  })

  test("does not load CV data for non-owner viewers", async () => {
    const { ProfileData } = await loadModule()

    await ProfileData({ userId: "student-1" })

    expect(getPublicStudentProfileMock).toHaveBeenCalledTimes(1)
    expect(getStudentCvMock).not.toHaveBeenCalled()
  })
})
