import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

const suspendedTree = new Promise<void>(() => {})
const shouldSuspendNavbar = false
const shouldSuspendSidebar = false

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

mock.module("@/components/RouteProgress", () => ({
  RouteProgress: () => <div data-testid="route-progress" />,
}))

const { DashboardClientProvider } = await import(
  "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
)

describe("DashboardClientProvider", () => {
  test("renders dashboard shell with navbar, sidebar and children", () => {
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
    expect(screen.getByTestId("dashboard-navbar")).toBeDefined()
    expect(screen.getByTestId("dashboard-sidebar")).toBeDefined()
  })
})
