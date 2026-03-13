import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

const suspendedForm = new Promise<void>(() => {})

mock.module(
  "@/app/[locale]/(auth)/reset-password/verify/_components/ResetPasswordVerifyForm",
  () => ({
    ResetPasswordVerifyForm: () => {
      throw suspendedForm
    },
  }),
)

const { default: ResetPasswordVerifyPage } = await import(
  "@/app/[locale]/(auth)/reset-password/verify/page"
)

describe("ResetPasswordVerifyPage", () => {
  test("renders a fallback while the search-param driven form suspends", () => {
    render(<ResetPasswordVerifyPage />)

    expect(
      screen.getByLabelText("Loading reset password verification form"),
    ).toBeDefined()
  })
})
