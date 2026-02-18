import { describe, test, expect, mock, beforeEach, afterAll } from "bun:test"

const mockSetUserPassword = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({ auth: { api: {} }, pendingWelcomeEmails: new Map() }))

describe("setUserPassword", () => {
  beforeEach(() => {
    mockSetUserPassword.mockClear()
  })

  test("should call auth.api.setUserPassword with userId and newPassword", async () => {
    const { setUserPassword } = await import("@/server/services/admin/set-password?fresh=1")
    await setUserPassword("user-1", "newpass123", { authApi: { setUserPassword: mockSetUserPassword } as any, getHeaders: mockHeaders })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockSetUserPassword.mock.calls as any)[0][0]
    expect(call.body.userId).toBe("user-1")
    expect(call.body.newPassword).toBe("newpass123")
  })

  test("should return result from auth API", async () => {
    const { setUserPassword } = await import("@/server/services/admin/set-password?fresh=2")
    const result = await setUserPassword("user-1", "pw", { authApi: { setUserPassword: mockSetUserPassword } as any, getHeaders: mockHeaders })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result).toEqual({ success: true } as any)
  })
})
