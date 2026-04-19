import { expect, type Page } from "@playwright/test"

export class ResetPasswordPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/en/reset-password")
    await this.page.waitForSelector("#reset-email", {
      state: "visible",
      timeout: 15000,
    })
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.fill("#reset-email", email)
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
      this.page.getByText(/if an account exists with this email/i),
    ).toBeVisible({ timeout: 15000 })
  }

  async waitForServerError(): Promise<void> {
    await expect(
      this.page.locator("div.text-destructive").first(),
    ).toBeVisible({ timeout: 15000 })
  }

  async waitForAnyResult(): Promise<void> {
    await Promise.race([
      this.waitForSuccessMessage(),
      this.waitForServerError(),
    ])
  }
}
