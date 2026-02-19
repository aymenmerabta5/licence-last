import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockBanUser = mock(() =>
  Promise.resolve({ user: { id: "u1", banned: true } }),
)
const mockUnbanUser = mock(() =>
  Promise.resolve({ user: { id: "u1", banned: false } }),
)
const mockHeaders = mock(() => Promise.resolve(new Headers()))

// Prevent loading real better-auth/env
mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))
// Patch next/headers once — safe even if the module was loaded earlier.
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("banUser", () => {
  beforeEach(() => {
    mockBanUser.mockClear()
    mockUnbanUser.mockClear()
  })

  test("should call auth.api.banUser with userId", async () => {
    const { banUser } = await import("@/server/services/admin/ban-user?fresh=1")
    await banUser(
      { userId: "user-1" },
      {
        authApi: { banUser: mockBanUser, unbanUser: mockUnbanUser },
        getHeaders: mockHeaders,
      },
    )
    expect(mockBanUser).toHaveBeenCalledTimes(1)
  })

  test("should pass banReason when provided", async () => {
    const { banUser } = await import("@/server/services/admin/ban-user?fresh=2")
    await banUser(
      { userId: "user-1", banReason: "Spam" },
      {
        authApi: { banUser: mockBanUser, unbanUser: mockUnbanUser },
        getHeaders: mockHeaders,
      },
    )
    expect(mockBanUser).toHaveBeenCalledTimes(1)
    const call = (mockBanUser.mock.calls as unknown[][])[0][0] as {
      body: { banReason?: string }
    }
    expect(call.body.banReason).toBe("Spam")
  })

  test("should pass banExpiresIn when provided", async () => {
    const { banUser } = await import("@/server/services/admin/ban-user?fresh=3")
    await banUser(
      { userId: "user-1", banExpiresIn: 86400 },
      {
        authApi: { banUser: mockBanUser, unbanUser: mockUnbanUser },
        getHeaders: mockHeaders,
      },
    )
    expect(mockBanUser).toHaveBeenCalledTimes(1)
    const call = (mockBanUser.mock.calls as unknown[][])[0][0] as {
      body: { banExpiresIn?: number }
    }
    expect(call.body.banExpiresIn).toBe(86400)
  })

  test("should return the result from auth API", async () => {
    const { banUser } = await import("@/server/services/admin/ban-user?fresh=4")
    const result = await banUser(
      { userId: "user-1" },
      {
        authApi: { banUser: mockBanUser, unbanUser: mockUnbanUser },
        getHeaders: mockHeaders,
      },
    )
    expect(result).toEqual({ user: { id: "u1", banned: true } })
  })
})

describe("unbanUser", () => {
  beforeEach(() => {
    mockUnbanUser.mockClear()
  })

  test("should call auth.api.unbanUser with userId", async () => {
    const { unbanUser } = await import(
      "@/server/services/admin/ban-user?fresh=5"
    )
    await unbanUser("user-1", {
      authApi: { banUser: mockBanUser, unbanUser: mockUnbanUser },
      getHeaders: mockHeaders,
    })
    expect(mockUnbanUser).toHaveBeenCalledTimes(1)
    const call = (mockUnbanUser.mock.calls as unknown[][])[0][0] as {
      body: { userId?: string }
    }
    expect(call.body.userId).toBe("user-1")
  })
})
