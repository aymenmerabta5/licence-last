import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

interface MockSession {
  session?: {
    impersonatedBy?: string
  } | null
}

const requireRoleMock = mock(async () => ({
  id: "company-1",
  role: "company_admin",
  name: "Company Admin",
  email: "company@example.com",
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

const { StatusContent } = await import(
  "@/app/[locale]/status/_components/StatusContent"
)

describe("StatusContent", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    requireRoleMock.mockClear()
    headersMock.mockClear()
    getSessionMock.mockClear()
    getSessionMock.mockResolvedValue(null)
  })

  test("renders the impersonation banner on status pages when the session is impersonated", async () => {
    getSessionMock.mockResolvedValueOnce({
      session: {
        impersonatedBy: "admin-1",
      },
    })

    const result = await StatusContent({
      children: <div>Status page</div>,
    })

    render(result)

    expect(screen.getByTestId("impersonation-banner").textContent).toBe(
      "Company Admin",
    )
    expect(screen.getByText("Status page")).toBeDefined()
  })

  test("does not render the impersonation banner on status pages when the session is not impersonated", async () => {
    const result = await StatusContent({
      children: <div>Status page</div>,
    })

    render(result)

    expect(screen.queryByTestId("impersonation-banner")).toBeNull()
  })
})
