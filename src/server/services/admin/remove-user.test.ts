import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockRemoveUser = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: { removeUser: mockRemoveUser } },
  pendingWelcomeEmails: new Map(),
}))
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("removeUser", () => {
  beforeEach(() => { mockRemoveUser.mockClear() })

  test("should call auth.api.removeUser with userId", async () => {
    const { removeUser } = await import("./remove-user")
    await removeUser("user-1")
    expect(mockRemoveUser).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockRemoveUser.mock.calls as any)[0][0]
    expect(call.body.userId).toBe("user-1")
  })

  test("should return result from auth API", async () => {
    const { removeUser } = await import("./remove-user")
    const result = await removeUser("user-1")
    expect(result).toEqual({ success: true })
  })
})
