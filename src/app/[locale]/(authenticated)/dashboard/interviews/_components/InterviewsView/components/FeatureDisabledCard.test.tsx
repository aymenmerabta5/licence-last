import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

mock.module("lucide-react", () => ({
  ShieldAlert: () => <span>ShieldAlert</span>,
}))

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "disabled.title": "Interviews unavailable",
      "disabled.description":
        "Interviews are currently disabled by platform settings.",
      "disabled.help": "Please contact your administrator to re-enable this feature.",
    }

    return translations[key] ?? key
  },
}))

const { FeatureDisabledCard } = await import(
  "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/FeatureDisabledCard"
)

describe("FeatureDisabledCard", () => {
  test("renders localized disabled-state copy", () => {
    render(<FeatureDisabledCard />)

    expect(screen.getByText("Interviews unavailable")).toBeTruthy()
    expect(
      screen.getByText(
        "Interviews are currently disabled by platform settings.",
      ),
    ).toBeTruthy()
    expect(
      screen.getByText(
        "Please contact your administrator to re-enable this feature.",
      ),
    ).toBeTruthy()
  })
})
