import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockCreateUser = mock<() => Promise<unknown>>(() =>
  Promise.resolve({ user: { id: "new-user", email: "a@b.com" } }),
)
const mockHeaders = mock(() => Promise.resolve(new Headers()))
const mockDbSet = mock(() => ({ where: () => Promise.resolve([]) }))
const mockDbSelectChain = mock(() => Promise.resolve([{ id: "fallback-id" }]))

mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))

mock.module("@/server/db", () => ({
  db: {
    update: () => ({ set: mockDbSet }),
    select: () =>
      ({
        from: () => ({
          where: () => ({
            limit: mockDbSelectChain,
          }),
        }),
      }),
  },
}))

// Import after mocks are registered so the module loads with mocked dependencies
const { createUser } = await import("@/server/services/admin/create-user")

describe("createUser", () => {
  beforeEach(() => {
    mockCreateUser.mockClear()
    mockDbSet.mockClear()
    mockDbSelectChain.mockClear()
  })

  test("should call auth.api.createUser with all fields", async () => {
    await createUser(
      {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "student",
      },
      { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders },
    )

    expect(mockCreateUser).toHaveBeenCalledTimes(1)
    const call = (mockCreateUser.mock.calls as unknown[][])[0][0] as {
      body: {
        email?: string
        name?: string
        role?: string
        data: { emailVerified?: boolean }
      }
    }
    expect(call.body.email).toBe("test@example.com")
    expect(call.body.name).toBe("Test User")
    expect(call.body.role).toBe("student")
    expect(call.body.data.emailVerified).toBe(true)
  })

  test("should return the created user", async () => {
    const result = await createUser(
      {
        email: "a@b.com",
        password: "pw",
        name: "A",
        role: "company_admin",
      },
      { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders },
    )
    expect(result).toEqual({ user: { id: "new-user", email: "a@b.com" } })
  })

  test("should pass headers to auth API", async () => {
    const h = new Headers({ cookie: "session=abc" })
    mockHeaders.mockResolvedValue(h)

    await createUser(
      { email: "a@b.com", password: "pw", name: "A", role: "student" },
      { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders },
    )

    const call = (mockCreateUser.mock.calls as unknown[][])[0][0] as {
      headers?: Headers
    }
    expect(call.headers).toBe(h)
  })

  test("should update user universityId when provided", async () => {
    const result = await createUser(
      {
        email: "student@uni.edu",
        password: "password123",
        name: "Student User",
        role: "student",
        universityId: "uni-1",
      },
      { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders },
    )

    expect(result).toEqual({ user: { id: "new-user", email: "a@b.com" } })
    expect(mockDbSet).toHaveBeenCalledTimes(1)
    expect(mockDbSet).toHaveBeenCalledWith({
      emailVerified: true,
      universityId: "uni-1",
    })
  })

  test("should activate user when universityId is not provided", async () => {
    await createUser(
      {
        email: "admin@company.com",
        password: "password123",
        name: "Admin User",
        role: "company_admin",
      },
      { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders },
    )

    expect(mockDbSet).toHaveBeenCalledTimes(1)
    expect(mockDbSet).toHaveBeenCalledWith({
      emailVerified: true,
      onboardingCompleted: true,
    })
  })

  test("should fall back to DB lookup when auth response lacks user id", async () => {
    mockCreateUser.mockImplementationOnce(() =>
      Promise.resolve({ id: "malformed" }),
    )

    await createUser(
      {
        email: "fallback@example.com",
        password: "password123",
        name: "Fallback User",
        role: "super_admin",
      },
      { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders },
    )

    expect(mockDbSelectChain).toHaveBeenCalledTimes(1)
    expect(mockDbSet).toHaveBeenCalledTimes(1)
    expect(mockDbSet).toHaveBeenCalledWith({
      emailVerified: true,
      onboardingCompleted: true,
    })
  })

  test("should throw when user cannot be located after creation", async () => {
    mockCreateUser.mockImplementationOnce(() =>
      Promise.resolve({ id: "malformed" }),
    )
    mockDbSelectChain.mockResolvedValueOnce([])

    await expect(
      createUser(
        {
          email: "missing@example.com",
          password: "password123",
          name: "Missing User",
          role: "super_admin",
        },
        { authApi: { createUser: mockCreateUser }, getHeaders: mockHeaders },
      ),
    ).rejects.toMatchObject({
      code: "USER_NOT_FOUND_AFTER_CREATION",
    })
  })
})
