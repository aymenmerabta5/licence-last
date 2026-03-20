import { afterAll, describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

mock.module(
  "@/app/[locale]/(authenticated)/_components/DashboardClientProvider",
  () => ({
    useDashboard: () => ({
      setIsSidebarOpen: () => {},
    }),
  }),
)

mock.module(
  "@/app/[locale]/(authenticated)/_components/DashboardNavbar/components/UserDropdown",
  () => ({
    UserDropdown: ({ user }: { user: { role?: string | null } }) => {
      const labelMap: Record<string, string> = {
        student: "Student",
        company_admin: "Company Admin",
        university_admin: "University Admin",
        super_admin: "Super Admin",
        dept_head: "Department Head",
      }
      const label = user.role ? (labelMap[user.role] ?? user.role) : "Student"

      return (
        <div data-testid="user-dropdown">
          <span>{label}</span>
          <div
            data-testid="user-dropdown-compact-badge"
            className="flex xl:hidden"
          >
            {label}
          </div>
        </div>
      )
    },
  }),
)

mock.module("@/components/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Lang</div>,
}))

mock.module("@/components/NotificationBell", () => ({
  NotificationBell: () => <div data-testid="notification-bell">Bell</div>,
}))

mock.module("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme</div>,
}))

mock.module("@/hooks/useLogout", () => ({
  useLogout: () => ({
    logout: async () => {},
    isLoggingOut: false,
  }),
}))

mock.module("@/i18n/routing", () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  usePathname: () => "/en/dashboard/messages",
}))

const { DashboardNavbar } = await import(
  "@/app/[locale]/(authenticated)/_components/DashboardNavbar"
)

describe("DashboardNavbar", () => {
  afterAll(() => {
    mock.restore()
  })

  test("does not render a search field in the header", () => {
    render(
      <DashboardNavbar
        user={{
          id: "user-1",
          name: "Seed User",
          email: "seed@example.com",
          role: "student",
        }}
      />,
    )

    expect(screen.queryByPlaceholderText("Search...")).toBeNull()
  })

  test("does not render the Stag logo in the small-device header", () => {
    const { container } = render(
      <DashboardNavbar
        user={{
          id: "user-1",
          name: "Seed User",
          email: "seed@example.com",
          role: "student",
        }}
      />,
    )

    expect(
      container.querySelector('[data-testid="dashboard-mobile-logo"]'),
    ).toBeNull()
  })
})
