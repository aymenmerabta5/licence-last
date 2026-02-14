import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockAdminUpdateUser = mock(() =>
  Promise.resolve({ user: { id: "u1", name: "Updated" } }),
)
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: { adminUpdateUser: mockAdminUpdateUser } },
}))
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("updateUser", () => {
  beforeEach(() => mockAdminUpdateUser.mockClear())

  test("should call auth.api.adminUpdateUser with userId and data", async () => {
    const { updateUser } = await import("./update-user")
    await updateUser("user-1", { name: "New Name" })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockAdminUpdateUser.mock.calls as any)[0][0]
    expect(call.body.userId).toBe("user-1")
    expect(call.body.data.name).toBe("New Name")
  })

  test("should pass email in data when provided", async () => {
    const { updateUser } = await import("./update-user")
    await updateUser("user-1", { email: "new@example.com" })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockAdminUpdateUser.mock.calls as any)[0][0]
    expect(call.body.data.email).toBe("new@example.com")
  })

  test("should pass role in data when provided", async () => {
    const { updateUser } = await import("./update-user")
    await updateUser("user-1", { role: "company_admin" })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockAdminUpdateUser.mock.calls as any)[0][0]
    expect(call.body.data.role).toBe("company_admin")
  })

  test("should return result from auth API", async () => {
    const { updateUser } = await import("./update-user")
    const result = await updateUser("user-1", { name: "X" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result).toEqual({ user: { id: "u1", name: "Updated" } } as any)
  })
})
