import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test"

interface MockApiErrorOptions {
  code?: string
  message?: string
}

interface SignupContext {
  body?: {
    accountType?: string
  }
}

interface SignupData {
  email: string
  emailVerified?: boolean
  role?: string
}

interface HookResult {
  data: Record<string, unknown>
}

interface AuthConfig {
  databaseHooks: {
    user: {
      create: {
        before: (data: SignupData, ctx?: SignupContext) => Promise<HookResult>
      }
    }
  }
}

interface MockAuthInstance {
  __config: AuthConfig
}

class MockAPIError extends Error {
  code?: string
  status: string

  constructor(status: string, options?: MockApiErrorOptions) {
    super(options?.message ?? status)
    this.code = options?.code
    this.status = status
  }
}

const betterAuthMock = mock(
  (config: AuthConfig): MockAuthInstance => ({ __config: config }),
)

const limitMock = mock(async () => [{ universityId: "uni-default" }])
const whereMock = mock(() => ({ limit: limitMock }))
const fromMock = mock(() => ({ where: whereMock }))
const selectMock = mock(() => ({ from: fromMock }))

const getEmailDomainMock = mock((email: string) =>
  email.includes("@") ? email.split("@")[1] : null,
)
const domainCandidatesMock = mock((domain: string) => [domain])

function applyAuthModuleMocks() {
  mock.module("better-auth", () => ({
    betterAuth: betterAuthMock,
  }))

  mock.module("better-auth/api", () => ({
    APIError: MockAPIError,
  }))

  mock.module("better-auth/adapters/drizzle", () => ({
    drizzleAdapter: () => ({}),
  }))

  mock.module("better-auth/next-js", () => ({
    nextCookies: () => ({}),
  }))

  mock.module("better-auth/plugins", () => ({
    admin: () => ({}),
    captcha: () => ({}),
    haveIBeenPwned: () => ({}),
    multiSession: () => ({}),
    openAPI: () => ({}),
    twoFactor: () => ({}),
  }))

  mock.module("@/env", () => ({
    env: {
      BETTER_AUTH_SECRET: "12345678901234567890123456789012",
      NEXT_PUBLIC_BETTER_AUTH_URL: "https://stag.example.com",
      TURNSTILE_SECRET_KEY: undefined,
    },
  }))

  mock.module("@/lib/auth-utils", () => ({
    domainCandidates: domainCandidatesMock,
    getEmailDomain: getEmailDomainMock,
  }))

  mock.module("@/lib/permissions", () => ({
    ac: {},
    companyAdmin: {},
    deptHead: {},
    student: {},
    superAdmin: {},
    universityAdmin: {},
  }))

  mock.module("@/server/email/sendEmail", () => ({
    sendEmail: mock(async () => undefined),
  }))
}

describe("src/lib/auth self-signup role hardening", () => {
  let beforeCreateUserHook: (data: SignupData, ctx?: SignupContext) => Promise<{
    data: Record<string, unknown>
  }>
  let originalDbSelect: unknown

  beforeEach(async () => {
    applyAuthModuleMocks()
    betterAuthMock.mockClear()
    selectMock.mockClear()
    fromMock.mockClear()
    whereMock.mockClear()
    limitMock.mockClear()
    getEmailDomainMock.mockClear()
    domainCandidatesMock.mockClear()
    limitMock.mockResolvedValue([{ universityId: "uni-default" }])

    const { db } = await import("@/server/db")
    originalDbSelect = (db as { select: unknown }).select
    ;(db as { select: unknown }).select = selectMock as unknown

    const { auth } = await import("@/lib/auth")
    beforeCreateUserHook = (auth as unknown as MockAuthInstance).__config
      .databaseHooks.user.create.before
  })

  afterEach(async () => {
    const { db } = await import("@/server/db")
    ;(db as { select: unknown }).select = originalDbSelect
  })

  test("rejects non-allowed self-signup roles", async () => {
    await expect(
      beforeCreateUserHook(
        {
          email: "admin@company.com",
          emailVerified: false,
        },
        { body: { accountType: "super_admin" } },
      ),
    ).rejects.toMatchObject({
      code: "ROLE_IS_NOT_ALLOWED_TO_BE_SET",
      message: "role is not allowed to be set",
    })
  })

  test("allows company self-signup without university auto-linking", async () => {
    const result = await beforeCreateUserHook(
      {
        email: "recruiter@company.com",
        emailVerified: false,
      },
      { body: { accountType: "company_admin" } },
    )

    expect(result.data.role).toBe("company_admin")
    expect(result.data.universityId).toBeUndefined()
    expect(getEmailDomainMock).not.toHaveBeenCalled()
    expect(selectMock).not.toHaveBeenCalled()
  })

  test("rejects university-admin self-signup role escalation", async () => {
    await expect(
      beforeCreateUserHook(
        {
          email: "admin@new-university.dz",
          emailVerified: false,
        },
        { body: { accountType: "university_admin" } },
      ),
    ).rejects.toMatchObject({
      code: "ROLE_IS_NOT_ALLOWED_TO_BE_SET",
      message: "role is not allowed to be set",
    })

    expect(getEmailDomainMock).not.toHaveBeenCalled()
    expect(selectMock).not.toHaveBeenCalled()
  })

  test("keeps student self-signup flow with approved university domain", async () => {
    limitMock.mockResolvedValueOnce([{ universityId: "uni-42" }])

    const result = await beforeCreateUserHook(
      {
        email: "student@university.edu",
        emailVerified: false,
      },
      { body: { accountType: "student" } },
    )

    expect(result.data.role).toBe("student")
    expect(result.data.universityId).toBe("uni-42")
    expect(getEmailDomainMock).toHaveBeenCalledWith("student@university.edu")
    expect(domainCandidatesMock).toHaveBeenCalledWith("university.edu")
  })

  test("still allows admin-created users to set privileged roles", async () => {
    const result = await beforeCreateUserHook({
      email: "new-admin@company.com",
      emailVerified: true,
      role: "company_admin",
    })

    expect(result.data.role).toBe("company_admin")
    expect(getEmailDomainMock).not.toHaveBeenCalled()
    expect(selectMock).not.toHaveBeenCalled()
  })
})
