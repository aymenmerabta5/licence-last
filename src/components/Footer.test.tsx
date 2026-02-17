import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"

import { Footer } from "@/components/Footer"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string, values?: { year?: number }) => {
    if (key === "legal.copyright" && values?.year) {
      return `copyright-${values.year}`
    }
    return key
  },
}))

mock.module("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe("src/components/Footer", () => {
  test("newsletter email input has an accessible label", () => {
    render(<Footer />)

    const input = screen.getByRole("textbox", {
      name: "newsletter.emailPlaceholder",
    })

    expect(input).toBeTruthy()
  })
})
