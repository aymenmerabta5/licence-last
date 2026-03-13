import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

const suspendedPathname = new Promise<string>(() => {})
const replaceMock = mock(() => {})
const usePathnameMock = mock(() => {
  throw suspendedPathname
})

mock.module("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => {
    if (key === "aria") return "Select language"
    if (key === "en") return "EN"
    if (key === "fr") return "FR"
    if (key === "ar") return "AR"
    return key
  },
}))

mock.module("@/i18n/routing", () => ({
  usePathname: usePathnameMock,
  useRouter: () => ({
    replace: replaceMock,
  }),
}))

mock.module("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuRadioGroup: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuRadioItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}))

const { LanguageSwitcher } = await import("@/components/LanguageSwitcher")

describe("LanguageSwitcher", () => {
  test("shows a stable fallback when pathname access suspends", () => {
    render(<LanguageSwitcher />)

    const trigger = screen.getByRole("button", { name: "Select language" })
    expect((trigger as HTMLButtonElement).disabled).toBe(true)
    expect(trigger.textContent).toContain("EN")
  })
})
