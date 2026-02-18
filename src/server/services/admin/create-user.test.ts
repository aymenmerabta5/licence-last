import { describe, test, expect, mock, beforeEach, afterAll } from "bun:test"

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
    }, { authApi: { createUser: mockCreateUser } as any, getHeaders: mockHeaders })

    expect(mockCreateUser).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockCreateUser.mock.calls as any)[0][0]
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
    }, { authApi: { createUser: mockCreateUser } as any, getHeaders: mockHeaders })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result).toEqual({ user: { id: "new-user", email: "a@b.com" } } as any)
  })

  test("should pass headers to auth API", async () => {
    const h = new Headers({ cookie: "session=abc" })
    mockHeaders.mockResolvedValue(h)

    const { createUser } = await import("@/server/services/admin/create-user?fresh=3")
    await createUser({ email: "a@b.com", password: "pw", name: "A", role: "student" }, { authApi: { createUser: mockCreateUser } as any, getHeaders: mockHeaders })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockCreateUser.mock.calls as any)[0][0]
    expect(call.headers).toBe(h)
  })
})
