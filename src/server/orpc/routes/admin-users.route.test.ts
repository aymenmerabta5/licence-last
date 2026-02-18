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

const listUsersMock = mock(async () => ({ users: [] }))
const listUniversityUsersMock = mock(async () => ({ users: [] }))
const banUserMock = mock(async () => ({ success: true }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  publicProcedureStrict: createProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
  authedSessionProcedureStandard: createProcedureMock(),
  authedProcedureGenerous: createProcedureMock(),
  authedSessionProcedureGenerous: createProcedureMock(),
  authedProcedureStrict: createProcedureMock(),
  adminProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
  adminProcedureAssistant: createProcedureMock(),
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

mock.module("@/server/services/admin/list-users", () => ({
  listUsers: listUsersMock,
}))
mock.module("@/server/services/admin/list-university-users", () => ({
  listUniversityUsers: listUniversityUsersMock,
}))
mock.module("@/server/services/admin/ban-user", () => ({
  banUser: banUserMock,
  unbanUser: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/admin/create-user", () => ({
  createUser: mock(async () => ({ userId: "user-1" })),
}))
mock.module("@/server/services/admin/remove-user", () => ({
  removeUser: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/admin/session-management", () => ({
  listUserSessions: mock(async () => ({ sessions: [] })),
  revokeSession: mock(async () => ({ success: true })),
  revokeAllSessions: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/admin/set-password", () => ({
  setUserPassword: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/admin/set-role", () => ({
  setUserRole: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/admin/update-user", () => ({
  updateUser: mock(async () => ({ success: true })),
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
mock.module("@/server/db/schema/auth", () => ({
  user: {
    id: "id-column",
    role: "role-column",
    universityId: "university-id-column",
  },
}))

describe("src/server/orpc/routes/admin-users", () => {
  beforeEach(() => {
    listUsersMock.mockClear()
    listUniversityUsersMock.mockClear()
    banUserMock.mockClear()
  })

  test("listUsersProcedure delegates to global list for super_admin", async () => {
    const { listUsersProcedure } = await import("@/server/orpc/routes/admin-users")

    const input = { limit: 20, offset: 0 }
    const result = await callProcedure(listUsersProcedure, {
      input,
      context: { user: { role: "super_admin" } },
    })

    expect(result).toEqual({ users: [] })
    expect(listUsersMock).toHaveBeenCalledWith(input)
  })

  test("listUsersProcedure requires university_id for university admins", async () => {
    const { listUsersProcedure } = await import("@/server/orpc/routes/admin-users")

    await expect(
      callProcedure(listUsersProcedure, {
        input: { limit: 20, offset: 0 },
        context: { user: { role: "university_admin", universityId: null } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "University admin must belong to a university",
    })
  })

  test("banUserProcedure delegates directly for super_admin", async () => {
    const { banUserProcedure } = await import("@/server/orpc/routes/admin-users")

    const result = await callProcedure(banUserProcedure, {
      input: { userId: "user-2" },
      context: { user: { role: "super_admin" } },
    })

    expect(result).toEqual({ success: true })
    expect(banUserMock).toHaveBeenCalledWith({ userId: "user-2" })
  })
})
