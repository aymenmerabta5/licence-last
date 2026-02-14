import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockSetRole = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: { setRole: mockSetRole } },
}))
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("setUserRole", () => {
  beforeEach(() => mockSetRole.mockClear())

  test("should call auth.api.setRole with userId and role", async () => {
    const { setUserRole } = await import("./set-role")
    await setUserRole("user-1", "super_admin")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockSetRole.mock.calls as any)[0][0]
    expect(call.body.userId).toBe("user-1")
    expect(call.body.role).toBe("super_admin")
  })

  test("should accept all valid roles", async () => {
    const { setUserRole } = await import("./set-role")
    const roles = ["student", "company_admin", "dept_head", "university_admin", "super_admin"] as const
    for (const role of roles) {
      mockSetRole.mockClear()
      await setUserRole("user-1", role)
      expect(mockSetRole).toHaveBeenCalledTimes(1)
    }
  })

  test("should return result from auth API", async () => {
    const { setUserRole } = await import("./set-role")
    const result = await setUserRole("user-1", "student")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result).toEqual({ success: true } as any)
  })
})
