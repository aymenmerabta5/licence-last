import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockCreateUser = mock(() => Promise.resolve({ user: { id: "new-user", email: "a@b.com" } }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({ auth: { api: {} }, pendingWelcomeEmails: new Map() }))

describe("createUser", () => {
  beforeEach(() => {
    mockCreateUser.mockClear()
  })

  test("should call auth.api.createUser with all fields", async () => {
    const { createUser } = await import("@/server/services/admin/create-user?fresh=1")
    await createUser({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      role: "student",
    }, { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders })

    expect(mockCreateUser).toHaveBeenCalledTimes(1)
    const call = (mockCreateUser.mock.calls as unknown[][])[0][0] as {
      body: { email?: string; name?: string; role?: string; data: { emailVerified?: boolean } }
    }
    expect(call.body.email).toBe("test@example.com")
    expect(call.body.name).toBe("Test User")
    expect(call.body.role).toBe("student")
    expect(call.body.data.emailVerified).toBe(true)
  })

  test("should return the created user", async () => {
    const { createUser } = await import("@/server/services/admin/create-user?fresh=2")
    const result = await createUser({
      email: "a@b.com",
      password: "pw",
      name: "A",
      role: "company_admin",
    }, { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders })
    expect(result).toEqual({ user: { id: "new-user", email: "a@b.com" } })
  })

  test("should pass headers to auth API", async () => {
    const h = new Headers({ cookie: "session=abc" })
    mockHeaders.mockResolvedValue(h)

    const { createUser } = await import("@/server/services/admin/create-user?fresh=3")
    await createUser({ email: "a@b.com", password: "pw", name: "A", role: "student" }, { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders })

    const call = (mockCreateUser.mock.calls as unknown[][])[0][0] as { headers?: Headers }
    expect(call.headers).toBe(h)
  })
})
