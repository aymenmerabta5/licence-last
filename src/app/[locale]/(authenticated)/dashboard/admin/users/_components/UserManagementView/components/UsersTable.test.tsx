import { describe, expect, mock, test } from "bun:test"
import { render, screen, within } from "@testing-library/react"
import type { ReactNode } from "react"

import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      noUsers: "No users",
      "table.user": "User",
      "table.role": "Role",
      "table.status": "Status",
      "table.created": "Created",
      "roles.student": "Student",
      "roles.university_admin": "University Admin",
      "roles.dept_head": "Department Head",
      "status.active": "Active",
      "status.banned": "Banned",
      "pagination.showing": "Showing {from}-{to} of {total}",
    }

    let text = translations[key] ?? key
    for (const [name, value] of Object.entries(values ?? {})) {
      text = text.replace(`{${name}}`, String(value))
    }
    return text
  },
}))

mock.module("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const { UsersTable } = await import(
  "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UsersTable"
)

describe("UsersTable", () => {
  test("renders mobile user cards with full metadata", () => {
    const users: AdminUser[] = [
      {
        id: "user-1",
        name: "Seed User",
        email: "seed@example.com",
        role: "university_admin",
        universityMembershipRole: "department_head",
        universityName: "University of Constantine 2",
        departmentName: "Political Science",
        banned: false,
        createdAt: "2026-04-24T00:00:00.000Z",
      },
    ]

    render(
      <UsersTable
        users={users}
        isLoading={false}
        page={0}
        totalPages={1}
        total={1}
        onPageChange={() => {}}
        onBan={() => {}}
        onUnban={() => {}}
        onSetRole={() => {}}
        onSetPassword={() => {}}
        onDelete={() => {}}
        canModerateUsers={false}
        canViewDetails={false}
        canSetRole={false}
        canSetPassword={false}
      />,
    )

    expect(screen.getAllByTestId("mobile-user-card")).toHaveLength(1)

    const mobileCard = screen.getByTestId("mobile-user-card")

    expect(
      within(mobileCard).getByText(
        "Political Science @ University of Constantine 2",
      ),
    ).toBeTruthy()
    expect(within(mobileCard).getByText("Created")).toBeTruthy()
    expect(within(mobileCard).getByText("Active")).toBeTruthy()
  })
})