import { afterAll, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      "dashboard.navbar.accountSettings": "Account Settings",
      "dashboard.navbar.viewProfile": "View Profile",
      "dashboard.navbar.profileSettings": "Profile Settings",
      "dashboard.navbar.logout": "Log out",
      "dashboard.navbar.roles.student": "Student",
      "dashboard.navbar.roles.company_admin": "Company Admin",
      "dashboard.navbar.roles.university_admin": "University Admin",
      "dashboard.navbar.roles.super_admin": "Super Admin",
      "dashboard.navbar.roles.dept_head": "Department Head",
    }

    return messages[`dashboard.navbar.${key}`] ?? key
  },
}))

mock.module("@/i18n/routing", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

mock.module("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => children,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <div />,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}))

const { UserDropdown } = await import(
  "@/app/[locale]/(authenticated)/_components/DashboardNavbar/components/UserDropdown"
)

describe("UserDropdown", () => {
  afterAll(() => {
    mock.restore()
  })

  test("renders the current role inside a badge in the header trigger", () => {
    cleanup()
    render(
      <UserDropdown
        user={{
          id: "user-1",
          name: "Seed Super Admin",
          email: "admin@stag.dz",
          role: "super_admin",
        }}
        onLogout={() => {}}
        isLoggingOut={false}
      />,
    )

    expect(screen.getAllByText("Super Admin").length).toBeGreaterThan(0)
  })

  test("keeps the compact role badge visible below xl screens", () => {
    cleanup()
    render(
      <UserDropdown
        user={{
          id: "user-1",
          name: "Seed Super Admin",
          email: "admin@stag.dz",
          role: "super_admin",
        }}
        onLogout={() => {}}
        isLoggingOut={false}
      />,
    )

    const compactBadge = screen.getByTestId("user-dropdown-compact-badge")

    expect(compactBadge.className).toContain("flex")
    expect(compactBadge.className).toContain("xl:hidden")
    expect(compactBadge.className).not.toContain("md:flex")
  })
})
