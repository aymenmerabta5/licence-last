import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockCreateUser = mock(() => Promise.resolve({ user: { id: "new-user", email: "a@b.com" } }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: { createUser: mockCreateUser } },
}))
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("createUser", () => {
  beforeEach(() => { mockCreateUser.mockClear() })

  test("should call auth.api.createUser with all fields", async () => {
    const { createUser } = await import("./create-user")
    await createUser({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      role: "student",
    })

    expect(mockCreateUser).toHaveBeenCalledTimes(1)
    const call = mockCreateUser.mock.calls[0][0]
    expect(call.body.email).toBe("test@example.com")
    expect(call.body.name).toBe("Test User")
    expect(call.body.role).toBe("student")
  })

  test("should return the created user", async () => {
    const { createUser } = await import("./create-user")
    const result = await createUser({
      email: "a@b.com",
      password: "pw",
      name: "A",
      role: "company_admin",
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result).toEqual({ user: { id: "new-user", email: "a@b.com" } } as any)
  })

  test("should pass headers to auth API", async () => {
    const h = new Headers({ cookie: "session=abc" })
    mockHeaders.mockResolvedValue(h)

    const { createUser } = await import("./create-user")
    await createUser({ email: "a@b.com", password: "pw", name: "A", role: "student" })

    const call = mockCreateUser.mock.calls[0][0]
    expect(call.headers).toBe(h)
  })
})
