import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockAdminUpdateUser = mock(() =>
  Promise.resolve({ user: { id: "u1", name: "Updated" } }),
)
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))

describe("updateUser", () => {
  beforeEach(() => {
    mockAdminUpdateUser.mockClear()
  })

  test("should call auth.api.adminUpdateUser with userId and data", async () => {
    const { updateUser } = await import(
      "@/server/services/admin/update-user?fresh=1"
    )
    await updateUser(
      "user-1",
      { name: "New Name" },
      {
        authApi: { adminUpdateUser: mockAdminUpdateUser },
        getHeaders: mockHeaders,
      },
    )

    const call = (mockAdminUpdateUser.mock.calls as unknown[][])[0][0] as {
      body: { userId?: string; data: { name?: string } }
    }
    expect(call.body.userId).toBe("user-1")
    expect(call.body.data.name).toBe("New Name")
  })

  test("should pass email in data when provided", async () => {
    const { updateUser } = await import(
      "@/server/services/admin/update-user?fresh=2"
    )
    await updateUser(
      "user-1",
      { email: "new@example.com" },
      {
        authApi: { adminUpdateUser: mockAdminUpdateUser },
        getHeaders: mockHeaders,
      },
    )

    const call = (mockAdminUpdateUser.mock.calls as unknown[][])[0][0] as {
      body: { data: { email?: string } }
    }
    expect(call.body.data.email).toBe("new@example.com")
  })

  test("should pass role in data when provided", async () => {
    const { updateUser } = await import(
      "@/server/services/admin/update-user?fresh=3"
    )
    await updateUser(
      "user-1",
      { role: "company_admin" },
      {
        authApi: { adminUpdateUser: mockAdminUpdateUser },
        getHeaders: mockHeaders,
      },
    )

    const call = (mockAdminUpdateUser.mock.calls as unknown[][])[0][0] as {
      body: { data: { role?: string } }
    }
    expect(call.body.data.role).toBe("company_admin")
  })

  test("should return result from auth API", async () => {
    const { updateUser } = await import(
      "@/server/services/admin/update-user?fresh=4"
    )
    const result = await updateUser(
      "user-1",
      { name: "X" },
      {
        authApi: { adminUpdateUser: mockAdminUpdateUser },
        getHeaders: mockHeaders,
      },
    )
    expect(result).toEqual({ user: { id: "u1", name: "Updated" } })
  })
})
