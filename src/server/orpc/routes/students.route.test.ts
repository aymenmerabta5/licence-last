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

const getStudentProfileMock = mock(async () => ({ userId: "student-1" }))
const getPublicStudentProfileMock = mock(async () => ({ userId: "student-1" }))
const upsertStudentProfileMock = mock(async () => ({ success: true }))
const upsertStudentSkillsMock = mock(async () => ({ success: true }))
const upsertStudentLanguagesMock = mock(async () => ({ success: true }))
const revalidateTagMock = mock(() => {})
const dbLimitQueue: unknown[][] = []
const dbJoinLimitQueue: unknown[][] = []
const featureFlagsState = {
  NOTIF_PREFERENCES: true,
  SAVED_OFFERS: true,
  INTERVIEWS: true,
  LANGUAGE_REQUIREMENTS: false,
}
const isFeatureEnabledMock = mock(
  (flag: keyof typeof featureFlagsState) => featureFlagsState[flag],
)

function applyStudentsRouteMocks() {
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
    companyAdminProcedureStandard: createProcedureMock(),
    companyAdminProcedureGenerous: createProcedureMock(),
    companyAdminProcedureAssistant: createProcedureMock(),
    studentProcedureStandard: createProcedureMock(),
    studentProcedureGenerous: createProcedureMock(),
    deptHeadProcedureStandard: createProcedureMock(),
    deptHeadProcedureGenerous: createProcedureMock(),
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

  mock.module("@/server/db", () => ({
    db: {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => dbLimitQueue.shift() ?? [],
          }),
          leftJoin: () => ({
            where: () => ({
              limit: async () => dbLimitQueue.shift() ?? [],
            }),
          }),
          innerJoin: () => ({
            where: () => ({
              limit: async () => dbJoinLimitQueue.shift() ?? [],
            }),
          }),
        }),
      }),
    },
  }))

  mock.module("@/server/services/students/get-profile", () => ({
    getStudentProfile: getStudentProfileMock,
  }))
  mock.module("@/server/services/students/get-public-profile", () => ({
    getPublicStudentProfile: getPublicStudentProfileMock,
  }))
  mock.module("@/server/services/students/upsert-profile", () => ({
    upsertStudentProfile: upsertStudentProfileMock,
  }))
  mock.module("@/server/services/students/upsert-skills", () => ({
    upsertStudentSkills: upsertStudentSkillsMock,
  }))
  mock.module("@/server/services/students/upsert-languages", () => ({
    upsertStudentLanguages: upsertStudentLanguagesMock,
  }))
  mock.module("@/server/services/students/upsert-profile-details", () => ({
    upsertStudentProfileDetails: mock(async () => ({ success: true })),
  }))
  mock.module("@/lib/feature-flags", () => ({
    FEATURE_FLAGS: featureFlagsState,
    isFeatureEnabled: isFeatureEnabledMock,
  }))
}

describe("src/server/orpc/routes/students", () => {
  beforeEach(() => {
    applyStudentsRouteMocks()
    getStudentProfileMock.mockClear()
    getPublicStudentProfileMock.mockClear()
    upsertStudentProfileMock.mockClear()
    upsertStudentSkillsMock.mockClear()
    upsertStudentLanguagesMock.mockClear()
    revalidateTagMock.mockClear()
    isFeatureEnabledMock.mockClear()
    dbLimitQueue.length = 0
    dbJoinLimitQueue.length = 0
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => featureFlagsState[flag],
    )
  })

  test("getStudentProfileProcedure forbids students from reading other profiles", async () => {
    const { getStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    await expect(
      callProcedure(getStudentProfileProcedure, {
        input: { userId: "student-2" },
        context: { user: { id: "student-1", role: "student" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You can only view your own profile",
    })
  })

  test("getStudentProfileProcedure allows same-university university admin", async () => {
    dbLimitQueue.push([{ universityId: "uni-1", departmentId: "dep-1" }])

    const { getStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    const result = await callProcedure(getStudentProfileProcedure, {
      input: { userId: "student-2" },
      context: {
        user: {
          id: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
        },
      },
    })

    expect(result).toEqual({ userId: "student-1" })
    expect(getStudentProfileMock).toHaveBeenCalledWith("student-2")
  })

  test("getStudentProfileProcedure rejects cross-university university admin", async () => {
    dbLimitQueue.push([{ universityId: "uni-2", departmentId: "dep-1" }])

    const { getStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    await expect(
      callProcedure(getStudentProfileProcedure, {
        input: { userId: "student-2" },
        context: {
          user: {
            id: "admin-1",
            role: "university_admin",
            universityId: "uni-1",
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this profile",
    })
  })

  test("getStudentProfileProcedure forbids company admins from probing missing private profiles", async () => {
    const { getStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    await expect(
      callProcedure(getStudentProfileProcedure, {
        input: { userId: "missing-student" },
        context: {
          user: {
            id: "company-admin-1",
            role: "company_admin",
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this profile",
    })

    expect(getStudentProfileMock).not.toHaveBeenCalled()
  })

  test("upsertStudentProfileProcedure revalidates student profile tags", async () => {
    const { upsertStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    const result = await callProcedure(upsertStudentProfileProcedure, {
      input: {
        bio: "Bio",
        skillTagIds: ["skill-1"],
      },
      context: { user: { id: "student-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(upsertStudentProfileMock).toHaveBeenCalledWith(
      { bio: "Bio" },
      ["skill-1"],
      "student-1",
      undefined,
    )
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })

  test("getPublicStudentProfileProcedure allows company admins with application relationship", async () => {
    // First query: companyMember lookup
    dbLimitQueue.push([{ companyId: "company-1" }])
    // Second query: application relationship check (via innerJoin)
    dbJoinLimitQueue.push([{ id: "app-1" }])

    const { getPublicStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    const result = await callProcedure(getPublicStudentProfileProcedure, {
      input: { userId: "student-1" },
      context: { user: { id: "company-admin-1", role: "company_admin" } },
    })

    expect(result).toEqual({ userId: "student-1" })
    expect(getPublicStudentProfileMock).toHaveBeenCalledWith(
      { id: "company-admin-1", role: "company_admin" },
      "student-1",
    )
  })

  test("getPublicStudentProfileProcedure rejects company admins without application relationship", async () => {
    // First query: companyMember lookup
    dbLimitQueue.push([{ companyId: "company-1" }])
    // Second query: no application relationship (via innerJoin)
    dbJoinLimitQueue.push([])

    const { getPublicStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    await expect(
      callProcedure(getPublicStudentProfileProcedure, {
        input: { userId: "student-1" },
        context: { user: { id: "company-admin-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You do not have access to this profile",
    })

    expect(getPublicStudentProfileMock).not.toHaveBeenCalled()
  })

  test("upsertStudentSkillsProcedure revalidates student tags", async () => {
    const { upsertStudentSkillsProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    const result = await callProcedure(upsertStudentSkillsProcedure, {
      input: { skillTagIds: ["skill-1", "skill-2"] },
      context: { user: { id: "student-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(upsertStudentSkillsMock).toHaveBeenCalledWith(
      ["skill-1", "skill-2"],
      "student-1",
    )
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })

  test("upsertStudentLanguagesProcedure revalidates student tags", async () => {
    const { upsertStudentLanguagesProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    const result = await callProcedure(upsertStudentLanguagesProcedure, {
      input: {
        languages: [{ languageCode: "en", proficiency: "b2" }],
      },
      context: { user: { id: "student-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(upsertStudentLanguagesMock).toHaveBeenCalledWith(
      [{ languageCode: "en", proficiency: "b2" }],
      "student-1",
    )
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })

  test("upsertStudentProfileProcedure forwards languages when language feature is enabled", async () => {
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => {
        if (flag === "LANGUAGE_REQUIREMENTS") return true
        return featureFlagsState[flag]
      },
    )

    const { upsertStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    await callProcedure(upsertStudentProfileProcedure, {
      input: {
        bio: "Bio",
        skillTagIds: ["skill-1"],
        languages: [{ languageCode: "en", proficiency: "b2" }],
      },
      context: { user: { id: "student-1" } },
    })

    expect(upsertStudentProfileMock).toHaveBeenCalledWith(
      { bio: "Bio" },
      ["skill-1"],
      "student-1",
      [{ languageCode: "en", proficiency: "b2" }],
    )
  })

  test("upsertStudentProfileProcedure requires languages when language feature is enabled", async () => {
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => {
        if (flag === "LANGUAGE_REQUIREMENTS") return true
        return featureFlagsState[flag]
      },
    )

    const { upsertStudentProfileProcedure } = await import(
      "@/server/orpc/routes/students"
    )

    await expect(
      callProcedure(upsertStudentProfileProcedure, {
        input: {
          bio: "Bio",
          skillTagIds: ["skill-1"],
        },
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "At least one language is required",
    })
  })
})
