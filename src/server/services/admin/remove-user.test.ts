import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockRemoveUser = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))

describe("removeUser", () => {
  beforeEach(() => {
    mockRemoveUser.mockClear()
  })

  test("should call auth.api.removeUser with userId", async () => {
    const { removeUser } = await import(
      "@/server/services/admin/remove-user?fresh=1"
    )
    await removeUser("user-1", {
      authApi: { removeUser: mockRemoveUser },
      getHeaders: mockHeaders,
    })
    expect(mockRemoveUser).toHaveBeenCalledTimes(1)
    const call = (mockRemoveUser.mock.calls as unknown[][])[0][0] as {
      body: { userId?: string }
    }
    expect(call.body.userId).toBe("user-1")
  })

  test("should return result from auth API", async () => {
    const { removeUser } = await import(
      "@/server/services/admin/remove-user?fresh=2"
    )
    const result = await removeUser("user-1", {
      authApi: { removeUser: mockRemoveUser },
      getHeaders: mockHeaders,
    })
    expect(result).toEqual({ success: true })
  })
})
