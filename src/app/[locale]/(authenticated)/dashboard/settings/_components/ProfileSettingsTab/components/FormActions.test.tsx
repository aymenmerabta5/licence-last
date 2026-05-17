import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"
import { FormActions } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/FormActions"
import type { ProfileSettingsFormApi } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/useProfileSettings"

describe("FormActions", () => {
  test("stacks action buttons on mobile while keeping full-width controls", () => {
    const form = {
      Subscribe: ({
        children,
      }: {
        children: ([isSubmitting]: [boolean]) => ReactNode
      }) => children([false]),
    } as unknown as ProfileSettingsFormApi

    render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          dashboard: {
            settings: {
              unsavedChanges: "You have unsaved changes.",
              discard: "Discard",
              saveChanges: "Save Changes",
            },
          },
        }}
      >
        <FormActions form={form} isBusy={false} onReset={() => {}} />
      </NextIntlClientProvider>,
    )

    expect(screen.getByText("Discard").className).toContain("w-full")
    expect(
      screen.getByRole("button", { name: /save changes/i }).className,
    ).toContain("w-full")
    expect(screen.getByText(/unsaved changes/i).className).toContain(
      "text-center",
    )
  })
})
