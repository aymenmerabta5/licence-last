import { expect, type Page } from "@playwright/test"

export class AdminValidationsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/en/dashboard/admin/validations")
    await expect(this.page).toHaveURL(/\/en\/dashboard\/admin\/validations/)
    await expect(this.page.locator("h1").first()).toBeVisible()
  }

  async expectValidationVisible(applicationId: string): Promise<void> {
    await expect(
      this.page.locator(
        `a[href*="/dashboard/admin/validations/${applicationId}"]`,
      ),
    ).toBeVisible({ timeout: 15000 })
  }

  async openValidation(applicationId: string): Promise<void> {
    await this.page.goto(`/en/dashboard/admin/validations/${applicationId}`)
    await expect(this.page).toHaveURL(
      new RegExp(`/en/dashboard/admin/validations/${applicationId}$`),
    )
  }

  async openValidationFromList(applicationId: string): Promise<void> {
    await this.goto()
    await this.page
      .locator(`a[href*="/dashboard/admin/validations/${applicationId}"]`)
      .first()
      .click()

    await expect(this.page).toHaveURL(
      new RegExp(`/en/dashboard/admin/validations/${applicationId}$`),
    )
  }

  async validatePlacement(startDate: Date, endDate: Date): Promise<void> {
    const dateInputs = this.page.locator('input[type="date"]')

    await dateInputs.nth(0).fill(startDate.toISOString().slice(0, 10))
    await dateInputs.nth(1).fill(endDate.toISOString().slice(0, 10))

    this.page.once("dialog", (dialog) => dialog.accept())
    await this.page
      .getByRole("button", { name: /validate & generate|validate/i })
      .first()
      .click()

    await expect(this.page).toHaveURL(/\/en\/dashboard\/admin\/validations$/, {
      timeout: 15000,
    })
  }

  async rejectPlacement(reason: string): Promise<void> {
    await this.page
      .getByRole("button", { name: /reject/i })
      .first()
      .click()
    await this.page.locator("textarea").first().fill(reason)
    await this.page.getByRole("button", { name: /confirm reject/i }).click()

    await expect(this.page).toHaveURL(/\/en\/dashboard\/admin\/validations$/, {
      timeout: 15000,
    })
  }
}
