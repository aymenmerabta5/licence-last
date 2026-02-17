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

const listUniversitiesMock = mock(async () => [])
const approveUniversityMock = mock(async () => ({ name: "USTHB" }))
const revalidateTagMock = mock(() => {})
const createNotificationMock = mock(async () => ({ success: true }))
const sendEmailMock = mock(async () => ({ success: true }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
  superAdminProcedureStandard: createProcedureMock(),
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

mock.module("@/env", () => ({
  env: { NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000" },
}))

mock.module("@/server/services/universities/list", () => ({
  listUniversities: listUniversitiesMock,
}))
mock.module("@/server/services/universities/get", () => ({
  getUniversityById: mock(async () => null),
}))
mock.module("@/server/services/universities/create", () => ({
  createUniversity: mock(async () => ({ universityId: "uni-1" })),
}))
mock.module("@/server/services/universities/approve", () => ({
  approveUniversity: approveUniversityMock,
}))
mock.module("@/server/services/universities/reject", () => ({
  rejectUniversity: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))
mock.module("@/server/email/sendEmail", () => ({
  sendEmail: sendEmailMock,
}))
mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => [{ userId: "admin-1", email: "admin@uni.dz" }],
      }),
    }),
  },
}))

describe("src/server/orpc/routes/universities", () => {
  beforeEach(() => {
    listUniversitiesMock.mockClear()
    approveUniversityMock.mockClear()
    revalidateTagMock.mockClear()
    createNotificationMock.mockClear()
    sendEmailMock.mockClear()
  })

  test("listUniversitiesProcedure enforces approved status for non-admin users", async () => {
    const { listUniversitiesProcedure } = await import("./universities")

    await callProcedure(listUniversitiesProcedure, {
      input: { status: "pending", limit: 10, offset: 0 },
      context: { user: { role: "student" } },
    })

    expect(listUniversitiesMock).toHaveBeenCalledWith({
      status: "approved",
      limit: 10,
      offset: 0,
    })
  })

  test("approveUniversityProcedure triggers cache invalidation and notifications", async () => {
    const { approveUniversityProcedure } = await import("./universities")

    const result = await callProcedure(approveUniversityProcedure, {
      input: { universityId: "uni-1" },
      context: { user: { id: "super-admin-1" } },
    })

    expect(result).toEqual({ name: "USTHB" })
    expect(approveUniversityMock).toHaveBeenCalledWith("uni-1", "super-admin-1")
    expect(createNotificationMock).toHaveBeenCalledTimes(1)
    expect(sendEmailMock).toHaveBeenCalledTimes(1)
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })
})
