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
const revalidateTagMock = mock(() => {})

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
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

mock.module("@/server/services/students/get-profile", () => ({
  getStudentProfile: getStudentProfileMock,
}))
mock.module("@/server/services/students/get-public-profile", () => ({
  getPublicStudentProfile: getPublicStudentProfileMock,
}))
mock.module("@/server/services/students/upsert-profile", () => ({
  upsertStudentProfile: upsertStudentProfileMock,
}))
mock.module("@/server/services/students/upsert-profile-details", () => ({
  upsertStudentProfileDetails: mock(async () => ({ success: true })),
}))

describe("src/server/orpc/routes/students", () => {
  beforeEach(() => {
    getStudentProfileMock.mockClear()
    getPublicStudentProfileMock.mockClear()
    upsertStudentProfileMock.mockClear()
    revalidateTagMock.mockClear()
  })

  test("getStudentProfileProcedure forbids students from reading other profiles", async () => {
    const { getStudentProfileProcedure } = await import("@/server/orpc/routes/students")

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

  test("upsertStudentProfileProcedure revalidates student profile tags", async () => {
    const { upsertStudentProfileProcedure } = await import("@/server/orpc/routes/students")

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
    )
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })

  test("getPublicStudentProfileProcedure allows company admins", async () => {
    const { getPublicStudentProfileProcedure } = await import("@/server/orpc/routes/students")

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
})
