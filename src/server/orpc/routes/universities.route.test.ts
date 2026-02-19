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

const listUniversitiesMock = mock(async () => [])
const approveUniversityMock = mock(async () => ({ name: "USTHB" }))
const updateUniversityMock = mock(async () => ({ universityId: "uni-1" }))
const deleteUniversityMock = mock(async () => ({
  success: true,
  universityId: "uni-1",
  affectedUserIds: ["admin-1", "student-1"],
}))
const revalidateTagMock = mock(() => {})
const emitNotificationMock = mock(async () => ({
  notificationId: "notification-1",
  inAppSkipped: false,
  emailAttempted: true,
  emailSkipped: false,
  emailSuccess: true,
}))

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
mock.module("@/server/services/universities/update", () => ({
  updateUniversity: updateUniversityMock,
}))
mock.module("@/server/services/universities/delete", () => ({
  deleteUniversity: deleteUniversityMock,
}))
mock.module("@/server/services/universities/approve", () => ({
  approveUniversity: approveUniversityMock,
}))
mock.module("@/server/services/universities/reject", () => ({
  rejectUniversity: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/notifications/emit", () => ({
  emitNotification: emitNotificationMock,
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
    mock.module("@/server/services/notifications/emit", () => ({
      emitNotification: emitNotificationMock,
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

    listUniversitiesMock.mockClear()
    approveUniversityMock.mockClear()
    updateUniversityMock.mockClear()
    deleteUniversityMock.mockClear()
    revalidateTagMock.mockClear()
    emitNotificationMock.mockClear()
  })

  test("listUniversitiesProcedure enforces approved status for non-admin users", async () => {
    const { listUniversitiesProcedure } = await import("@/server/orpc/routes/universities")

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
    const { approveUniversityProcedure } = await import("@/server/orpc/routes/universities")

    const result = await callProcedure(approveUniversityProcedure, {
      input: { universityId: "uni-1" },
      context: { user: { id: "super-admin-1" } },
    })

    expect(result).toEqual({ name: "USTHB" })
    expect(approveUniversityMock).toHaveBeenCalledWith("uni-1", "super-admin-1")
    expect(emitNotificationMock).toHaveBeenCalledTimes(1)
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })

  test("updateUniversityProcedure updates university and invalidates cache tags", async () => {
    const { updateUniversityProcedure } = await import("@/server/orpc/routes/universities")

    const result = await callProcedure(updateUniversityProcedure, {
      input: {
        universityId: "uni-1",
        name: "Updated University",
        city: "Algiers",
      },
      context: { user: { id: "super-admin-1" } },
    })

    expect(result).toEqual({ universityId: "uni-1" })
    expect(updateUniversityMock).toHaveBeenCalledWith("uni-1", {
      name: "Updated University",
      abbreviation: undefined,
      phone: undefined,
      wilayaCode: undefined,
      city: "Algiers",
      address: undefined,
    })
    expect(revalidateTagMock).toHaveBeenCalledTimes(3)
  })

  test("deleteUniversityProcedure returns affected user count and invalidates caches", async () => {
    const { deleteUniversityProcedure } = await import("@/server/orpc/routes/universities")

    const result = await callProcedure(deleteUniversityProcedure, {
      input: { universityId: "uni-1" },
      context: { user: { id: "super-admin-1" } },
    })

    expect(result).toEqual({
      success: true,
      universityId: "uni-1",
      affectedUsers: 2,
    })
    expect(deleteUniversityMock).toHaveBeenCalledWith("uni-1")
    expect(revalidateTagMock).toHaveBeenCalledTimes(4)
  })

  test("deleteUniversityProcedure maps service not-found errors", async () => {
    deleteUniversityMock.mockRejectedValueOnce(
      new ServiceError("UNIVERSITY_NOT_FOUND", "University not found"),
    )

    const { deleteUniversityProcedure } = await import("@/server/orpc/routes/universities")

    await expect(
      callProcedure(deleteUniversityProcedure, {
        input: { universityId: "missing" },
        context: { user: { id: "super-admin-1" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "University not found",
    })
  })
})
