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

interface SessionRecord {
  id: string
  token: string
  userId: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

const listMySessionsMock = mock<() => Promise<SessionRecord[]>>(async () => [])

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
  uploadImageToS3: mock(async () => ({
    url: "https://example.com/avatar.png",
  })),
}))
mock.module("@/server/services/users/session-management", () => ({
  listMySessions: listMySessionsMock,
  revokeMySession: mock(async () => ({ success: true })),
  revokeOtherSessions: mock(async () => ({ success: true })),
}))
mock.module("@/server/storage/s3", () => ({
  uploadFile: mock(async () => "https://example.com/mock-upload.png"),
  deleteFile: mock(async () => {}),
  getFile: mock(async () => Buffer.from("")),
  isConfigured: () => true,
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
    listMySessionsMock.mockClear()
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
    expect(updateMeMock).toHaveBeenCalledWith("user-1", {
      name: "Updated Name",
    })
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

  test("listMySessionsProcedure returns tokenPrefix and computes isCurrent", async () => {
    const createdAt = new Date("2026-02-01T08:00:00.000Z")
    const updatedAt = new Date("2026-02-05T08:00:00.000Z")
    const expiresAt = new Date("2026-03-01T08:00:00.000Z")

    listMySessionsMock.mockResolvedValueOnce([
      {
        id: "session-1",
        token: "token-1",
        userId: "user-1",
        ipAddress: "127.0.0.1",
        userAgent: "agent-1",
        createdAt,
        updatedAt,
        expiresAt,
      },
      {
        id: "session-2",
        token: "token-2",
        userId: "user-1",
        ipAddress: "127.0.0.2",
        userAgent: "agent-2",
        createdAt,
        updatedAt,
        expiresAt,
      },
    ])

    const { listMySessionsProcedure } = await import("@/server/orpc/routes/users")

    const result = await callProcedure(listMySessionsProcedure, {
      context: { session: { token: "token-2" } },
    })

    expect(result).toEqual([
      {
        id: "session-1",
        tokenPrefix: "en-1",
        userId: "user-1",
        ipAddress: "127.0.0.1",
        userAgent: "agent-1",
        createdAt,
        updatedAt,
        expiresAt,
        isCurrent: false,
      },
      {
        id: "session-2",
        tokenPrefix: "en-2",
        userId: "user-1",
        ipAddress: "127.0.0.2",
        userAgent: "agent-2",
        createdAt,
        updatedAt,
        expiresAt,
        isCurrent: true,
      },
    ])
  })
})
