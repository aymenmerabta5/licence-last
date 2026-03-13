import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

const suspendedTree = new Promise<void>(() => {})
let shouldSuspendNavbar = false
let shouldSuspendSidebar = false

mock.module(
  "@/app/[locale]/(authenticated)/_components/DashboardNavbar",
  () => ({
    DashboardNavbar: () => {
      if (shouldSuspendNavbar) {
        throw suspendedTree
      }

      return <div data-testid="dashboard-navbar">Navbar</div>
    },
  }),
)

mock.module(
  "@/app/[locale]/(authenticated)/_components/DashboardSidebar",
  () => ({
    DashboardSidebar: () => {
      if (shouldSuspendSidebar) {
        throw suspendedTree
      }

      return <aside data-testid="dashboard-sidebar">Sidebar</aside>
    },
  }),
)

mock.module("@/components/ImpersonationBanner", () => ({
  ImpersonationBanner: ({ userName }: { userName: string }) => (
    <div data-testid="impersonation-banner">{userName}</div>
  ),
}))

const { DashboardClientProvider } = await import(
  "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
)

describe("DashboardClientProvider", () => {
  test("keeps the dashboard shell rendering when navbar and sidebar suspend", () => {
    shouldSuspendNavbar = true
    shouldSuspendSidebar = true

    render(
      <DashboardClientProvider
        user={{
          id: "user-1",
          name: "Aymen",
          email: "aymen@example.com",
          role: "student",
        }}
      >
        <div>Messages content</div>
      </DashboardClientProvider>,
    )

    expect(screen.getByText("Messages content")).toBeDefined()

    shouldSuspendNavbar = false
    shouldSuspendSidebar = false
  })
})
