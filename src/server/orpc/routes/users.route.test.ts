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

const updateMeMock = mock(async () => ({
  id: "user-1",
  name: "Updated Name",
  email: "user@example.com",
  image: null,
}))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedSessionProcedureGenerous: createProcedureMock(),
  authedSessionProcedureStandard: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/users/get-me", () => ({
  getMe: mock(async (user: unknown) => user),
}))
mock.module("@/server/services/users/update-me", () => ({
  updateMe: updateMeMock,
}))
mock.module("@/server/services/uploads/upload-image", () => ({
  uploadImageToS3: mock(async () => ({ url: "https://example.com/avatar.png" })),
}))
mock.module("@/server/services/users/session-management", () => ({
  listMySessions: mock(async () => []),
  revokeMySession: mock(async () => ({ success: true })),
  revokeOtherSessions: mock(async () => ({ success: true })),
}))
mock.module("@/server/storage/s3", () => ({
  deleteFile: mock(async () => {}),
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

describe("src/server/orpc/routes/users", () => {
  beforeEach(() => {
    updateMeMock.mockClear()
  })

  test("updateMeProcedure updates own profile", async () => {
    const { updateMeProcedure } = await import("@/server/orpc/routes/users")

    const result = await callProcedure(updateMeProcedure, {
      input: { name: "Updated Name" },
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({
      id: "user-1",
      name: "Updated Name",
      email: "user@example.com",
      image: null,
    })
    expect(updateMeMock).toHaveBeenCalledWith("user-1", { name: "Updated Name" })
  })

  test("updateMeProcedure maps typed user errors", async () => {
    updateMeMock.mockRejectedValueOnce(
      new ServiceError("USER_NOT_FOUND", "User not found"),
    )
    const { updateMeProcedure } = await import("@/server/orpc/routes/users")

    await expect(
      callProcedure(updateMeProcedure, {
        input: { name: "Updated Name" },
        context: { user: { id: "user-1" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "User not found",
    })
  })
})
