import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

mock.module("next-intl", () => ({
  useTranslations:
    () => (key: string, values?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        unnamedMember: "Unnamed member",
        "roles.owner": "Owner",
        "roles.recruiter": "Recruiter",
        you: "You",
        joined: "Joined {date}",
        unknownDate: "Unknown date",
        remove: "Remove",
        empty: "No members",
      }

      let text = translations[key] ?? key
      for (const [name, value] of Object.entries(values ?? {})) {
        text = text.replace(`{${name}}`, String(value))
      }
      return text
    },
}))

const { MembersList } = await import(
  "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/MembersList"
)

describe("MembersList", () => {
  test("renders localized role labels instead of raw enum values", () => {
    render(
      <MembersList
        members={[
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
        ]}
        currentUserId="owner-1"
        canManageMembers={true}
        isRemoving={false}
        onRemove={mock(() => {})}
      />,
    )

    expect(screen.getByText("Owner")).toBeTruthy()
    expect(screen.getByText("Recruiter")).toBeTruthy()
  })
})
