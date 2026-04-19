import { expect, type Page } from "@playwright/test"

export class ResetPasswordVerifyPage {
  constructor(private readonly page: Page) {}

  async goto(token?: string): Promise<void> {
    const url = token
      ? `/en/reset-password/verify?token=${token}`
      : "/en/reset-password/verify"
    await this.page.goto(url)
    await this.page.waitForSelector("form", {
      state: "visible",
      timeout: 15000,
    })
  }

  async fillNewPassword(password: string): Promise<void> {
    await this.page.fill("#new-password", password)
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.page.fill("#confirm-new-password", password)
  }

  async submit(): Promise<void> {
    await this.page.click('button[type="submit"]')
  }

  async goToLoginPage(): Promise<void> {
    await this.page
      .getByRole("link", { name: /back to sign in/i })
      .click()
  }

  async waitForSuccessMessage(): Promise<void> {
    await expect(
      this.page.getByText(/your password was updated/i),
    ).toBeVisible({ timeout: 15000 })
  }

  async waitForInvalidTokenError(): Promise<void> {
    await expect(
      this.page.getByText(/invalid or has expired/i),
    ).toBeVisible({ timeout: 15000 })
  }
}
