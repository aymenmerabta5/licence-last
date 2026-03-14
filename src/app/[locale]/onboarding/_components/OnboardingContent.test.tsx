import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

interface MockSession {
  session?: {
    impersonatedBy?: string
  } | null
}

const requireRoleMock = mock(async () => ({
  id: "student-1",
  role: "student",
  name: "Student User",
  email: "student@example.com",
}))
const headersMock = mock(async () => new Headers())
const getSessionMock = mock<() => Promise<MockSession | null>>(async () => null)

mock.module("@/lib/auth-guards", () => ({
  requireRole: requireRoleMock,
}))

mock.module("next/headers", () => ({
  headers: headersMock,
}))

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}))

mock.module("@/components/ImpersonationBanner", () => ({
  ImpersonationBanner: ({ userName }: { userName: string }) => (
    <div data-testid="impersonation-banner">{userName}</div>
  ),
}))

const { OnboardingContent } = await import(
  "@/app/[locale]/onboarding/_components/OnboardingContent"
)

describe("OnboardingContent", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    requireRoleMock.mockClear()
    headersMock.mockClear()
    getSessionMock.mockClear()
    getSessionMock.mockResolvedValue(null)
  })

  test("renders the impersonation banner during onboarding when the session is impersonated", async () => {
    getSessionMock.mockResolvedValueOnce({
      session: {
        impersonatedBy: "admin-1",
      },
    })

    const result = await OnboardingContent({
      children: <div>Onboarding form</div>,
    })

    render(result)

    expect(screen.getByTestId("impersonation-banner").textContent).toBe(
      "Student User",
    )
    expect(screen.getByText("Onboarding form")).toBeDefined()
  })

  test("does not render the impersonation banner when the session is not impersonated", async () => {
    const result = await OnboardingContent({
      children: <div>Onboarding form</div>,
    })

    render(result)

    expect(screen.queryByTestId("impersonation-banner")).toBeNull()
  })
})
