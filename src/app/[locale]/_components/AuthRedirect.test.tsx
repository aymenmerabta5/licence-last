import { beforeEach, describe, expect, mock, test } from "bun:test"

const headersMock = mock(async () => new Headers())

interface MockSessionResult {
  user: {
    id: string
    email: string
    role: string
    name: string
    onboardingCompleted: boolean
    banned: boolean
  }
}

const getFreshAuthSessionMock = mock(
  async (): Promise<MockSessionResult | null> => null,
)
const getMeMock = mock(async () => ({
  user: {
    id: "user-1",
    role: "student",
    effectiveRole: "student",
    onboardingCompleted: true,
  },
  company: null,
  university: null,
}))
const redirectMock = mock((path: string) => {
  throw new Error(`redirect:${path}`)
})

mock.module("next/headers", () => ({
  headers: headersMock,
}))

mock.module("next/navigation", () => ({
  redirect: redirectMock,
}))

mock.module("@/server/auth/get-fresh-session", () => ({
  getFreshAuthSession: getFreshAuthSessionMock,
}))

mock.module("@/server/services/users/get-me", () => ({
  getMe: getMeMock,
}))

describe("src/app/[locale]/_components/AuthRedirect", () => {
  beforeEach(() => {
    headersMock.mockClear()
    getFreshAuthSessionMock.mockClear()
    getMeMock.mockClear()
    redirectMock.mockClear()
    getFreshAuthSessionMock.mockResolvedValue(null)
  })

  test("does not redirect banned users back into the dashboard", async () => {
    getFreshAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "student",
        name: "User",
        onboardingCompleted: true,
        banned: true,
      },
    })

    const mod = await import(
      `@/app/[locale]/_components/AuthRedirect?test=${Date.now()}`
    )

    const result = await mod.AuthRedirect({ locale: "en" })

    expect(result).toBeNull()
    expect(getMeMock).not.toHaveBeenCalled()
    expect(redirectMock).not.toHaveBeenCalled()
  })

  test("redirects active users with a fresh session lookup", async () => {
    getFreshAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "student",
        name: "User",
        onboardingCompleted: true,
        banned: false,
      },
    })

    const mod = await import(
      `@/app/[locale]/_components/AuthRedirect?test=${Date.now()}`
    )

    await expect(mod.AuthRedirect({ locale: "fr" })).rejects.toThrow(
      "redirect:/fr/dashboard",
    )
    expect(getFreshAuthSessionMock).toHaveBeenCalledTimes(1)
    expect(redirectMock).toHaveBeenCalledWith("/fr/dashboard")
  })
})
