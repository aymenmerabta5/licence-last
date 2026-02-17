import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockBanUser = mock(() => Promise.resolve({ user: { id: "u1", banned: true } }))
const mockUnbanUser = mock(() => Promise.resolve({ user: { id: "u1", banned: false } }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: { banUser: mockBanUser, unbanUser: mockUnbanUser } },
  pendingWelcomeEmails: new Map(),
}))
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("banUser", () => {
  beforeEach(() => {
    mockBanUser.mockClear()
    mockUnbanUser.mockClear()
  })

  test("should call auth.api.banUser with userId", async () => {
    const { banUser } = await import("./ban-user")
    await banUser({ userId: "user-1" })
    expect(mockBanUser).toHaveBeenCalledTimes(1)
  })

  test("should pass banReason when provided", async () => {
    const { banUser } = await import("./ban-user")
    await banUser({ userId: "user-1", banReason: "Spam" })
    expect(mockBanUser).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockBanUser.mock.calls as any)[0][0]
    expect(call.body.banReason).toBe("Spam")
  })

  test("should pass banExpiresIn when provided", async () => {
    const { banUser } = await import("./ban-user")
    await banUser({ userId: "user-1", banExpiresIn: 86400 })
    expect(mockBanUser).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockBanUser.mock.calls as any)[0][0]
    expect(call.body.banExpiresIn).toBe(86400)
  })

  test("should return the result from auth API", async () => {
    const { banUser } = await import("./ban-user")
    const result = await banUser({ userId: "user-1" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result).toEqual({ user: { id: "u1", banned: true } } as any)
  })
})

describe("unbanUser", () => {
  beforeEach(() => { mockUnbanUser.mockClear() })

  test("should call auth.api.unbanUser with userId", async () => {
    const { unbanUser } = await import("./ban-user")
    await unbanUser("user-1")
    expect(mockUnbanUser).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockUnbanUser.mock.calls as any)[0][0]
    expect(call.body.userId).toBe("user-1")
  })
})
