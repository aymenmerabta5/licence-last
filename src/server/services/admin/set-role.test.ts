import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSetRole = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))

describe("setUserRole", () => {
  beforeEach(() => {
    mockSetRole.mockClear()
  })

  test("should call auth.api.setRole with userId and role", async () => {
    const { setUserRole } = await import(
      "@/server/services/admin/set-role?fresh=1"
    )
    await setUserRole("user-1", "super_admin", {
      authApi: { setRole: mockSetRole },
      getHeaders: mockHeaders,
    })

    const call = (mockSetRole.mock.calls as unknown[][])[0][0] as {
      body: { userId?: string; role?: string }
    }
    expect(call.body.userId).toBe("user-1")
    expect(call.body.role).toBe("super_admin")
  })

  test("should accept all valid roles", async () => {
    const { setUserRole } = await import(
      "@/server/services/admin/set-role?fresh=2"
    )
    const roles = [
      "student",
      "company_admin",
      "university_admin",
      "super_admin",
    ] as const
    for (const role of roles) {
      mockSetRole.mockClear()
      await setUserRole("user-1", role, {
        authApi: { setRole: mockSetRole },
        getHeaders: mockHeaders,
      })
      expect(mockSetRole).toHaveBeenCalledTimes(1)
    }
  })

  test("should return result from auth API", async () => {
    const { setUserRole } = await import(
      "@/server/services/admin/set-role?fresh=3"
    )
    const result = await setUserRole("user-1", "student", {
      authApi: { setRole: mockSetRole },
      getHeaders: mockHeaders,
    })
    expect(result).toEqual({ success: true })
  })
})
