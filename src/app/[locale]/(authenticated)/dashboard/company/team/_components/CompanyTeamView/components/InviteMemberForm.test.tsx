import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      inviteKicker: "Invite Recruiter",
      inviteDescription: "Add a teammate.",
      nameLabel: "Full name",
      namePlaceholder: "Full name (optional)",
      emailLabel: "Work email",
      emailPlaceholder: "name@company.com",
      inviteButton: "Invite Member",
      inviting: "Inviting...",
    }

    return translations[key] ?? key
  },
}))

const { InviteMemberForm } = await import(
  "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/InviteMemberForm"
)

describe("InviteMemberForm", () => {
  afterEach(() => {
    cleanup()
  })

  test("renders explicit labels for the invite inputs", () => {
    render(
      <InviteMemberForm
        email=""
        name=""
        isPending={false}
        onEmailChange={mock(() => {})}
        onNameChange={mock(() => {})}
        onSubmit={mock((event) => event.preventDefault())}
      />,
    )

    expect(screen.getByLabelText("Full name")).toBeTruthy()
    expect(screen.getByLabelText("Work email")).toBeTruthy()
    expect(screen.getByPlaceholderText("name@company.com")).toBeTruthy()
  })
})
