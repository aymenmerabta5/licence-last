import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"

import { FormActions } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/FormActions"

describe("FormActions", () => {
  test("stacks action buttons on mobile while keeping full-width controls", () => {
    const form = {
      Subscribe: ({ children }: { children: ([isSubmitting]: [boolean]) => ReactNode }) =>
        children([false]),
    }

    render(<FormActions form={form} isBusy={false} onReset={() => {}} />)

    expect(screen.getByText("Discard").className).toContain("w-full")
    expect(screen.getByRole("button", { name: /save changes/i }).className).toContain("w-full")
    expect(screen.getByText(/unsaved changes/i).className).toContain("text-center")
  })
})