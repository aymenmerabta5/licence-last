import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      "dashboard.superAdmin.users.searchPlaceholder": "Search by email...",
      "dashboard.superAdmin.users.filterByRole": "Filter by role",
      "dashboard.superAdmin.users.allRoles": "All roles",
      "dashboard.superAdmin.users.createUser": "Create User",
      "dashboard.superAdmin.users.roles.student": "Student",
      "dashboard.superAdmin.users.roles.company_admin": "Company Admin",
      "dashboard.superAdmin.users.roles.university_admin": "University Admin",
      "dashboard.superAdmin.users.roles.super_admin": "Super Admin",
    }

    return messages[`dashboard.superAdmin.users.${key}`] ?? key
  },
}))

mock.module("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}))

mock.module("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}))

mock.module("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => children,
  SelectContent: ({ children }: { children: React.ReactNode }) => children,
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <div className={className}>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}))

const { UserFilters } = await import(
  "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserFilters"
)

describe("UserFilters", () => {
  test("uses a tablet-friendly grid layout before expanding to a full desktop row", () => {
    render(
      <UserFilters
        search=""
        onSearchChange={() => {}}
        roleFilter="all"
        onRoleFilterChange={() => {}}
        onCreateClick={() => {}}
        canCreate
      />,
    )

    const filters = screen.getByTestId("user-filters")

    expect(filters.className).toContain("md:grid-cols-[minmax(0,1fr)_180px]")
    expect(filters.className).toContain(
      "xl:grid-cols-[minmax(0,1fr)_180px_auto]",
    )
  })
})
