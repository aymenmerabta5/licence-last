import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import type * as React from "react"

const removeMutateAsyncMock = mock(async (_variables?: unknown) => ({}))

mock.module("lucide-react", () => ({
  Loader2: () => <span>Loader2</span>,
  RefreshCw: () => <span>RefreshCw</span>,
  Users: () => <span>Users</span>,
}))

mock.module("next-intl", () => ({
  useTranslations:
    (namespace?: string) =>
    (key: string, values?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      const translations: Record<string, string> = {
        "dashboard.company.team.kicker": "Company Workspace",
        "dashboard.company.team.title": "Team Members",
        "dashboard.company.team.subtitle": "Manage team access.",
        "dashboard.company.team.inviteKicker": "Invite Recruiter",
        "dashboard.company.team.inviteDescription": "Add a teammate.",
        "dashboard.company.team.nameLabel": "Full name",
        "dashboard.company.team.namePlaceholder": "Full name (optional)",
        "dashboard.company.team.emailLabel": "Work email",
        "dashboard.company.team.emailPlaceholder": "name@company.com",
        "dashboard.company.team.inviteButton": "Invite Member",
        "dashboard.company.team.inviting": "Inviting...",
        "dashboard.company.team.unnamedMember": "Unnamed member",
        "dashboard.company.team.roles.owner": "Owner",
        "dashboard.company.team.roles.recruiter": "Recruiter",
        "dashboard.company.team.you": "You",
        "dashboard.company.team.joined": "Joined {date}",
        "dashboard.company.team.unknownDate": "Unknown date",
        "dashboard.company.team.remove": "Remove",
        "dashboard.company.team.removeDialog.title": "Remove member",
        "dashboard.company.team.removeDialog.description":
          "Remove {name} from the company workspace?",
        "dashboard.company.team.removeDialog.cancel": "Cancel",
        "dashboard.company.team.removeDialog.confirm": "Remove member",
        "errors.common.companyMemberRemoved": "Member removed",
        "errors.common.companyMemberRemoveFailed": "Remove failed",
      }

      let text = translations[fullKey] ?? fullKey
      for (const [name, value] of Object.entries(values ?? {})) {
        text = text.replace(`{${name}}`, String(value))
      }
      return text
    },
}))

mock.module("sonner", () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
  },
}))

mock.module("@/lib/error-message", () => ({
  resolveLocalizedError: () => "Localized error",
}))

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/hooks/useCompanyTeamData",
  () => ({
    useCompanyTeamData: () => ({
      members: [
        {
          userId: "owner-1",
          email: "owner@example.com",
          name: "Owner User",
          role: "owner",
          joinedAt: "2030-01-01T00:00:00.000Z",
        },
        {
          userId: "recruiter-1",
          email: "recruiter@example.com",
          name: "Recruiter User",
          role: "recruiter",
          joinedAt: "2030-01-02T00:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      inviteMutation: {
        isPending: false,
        mutateAsync: mock(async () => ({ createdUser: true })),
      },
      removeMutation: {
        isPending: false,
        mutateAsync: removeMutateAsyncMock,
        mutate: (variables: unknown) => removeMutateAsyncMock(variables),
      },
    }),
  }),
)

mock.module("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

const { CompanyTeamView } = await import(
  "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView"
)

describe("CompanyTeamView", () => {
  test("waits for explicit confirmation before removing a member", async () => {
    removeMutateAsyncMock.mockClear()

    render(<CompanyTeamView currentUserId="owner-1" />)

    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(removeMutateAsyncMock).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: "Remove member" }))
    expect(removeMutateAsyncMock).toHaveBeenCalledWith({
      userId: "recruiter-1",
    })
  })
})
