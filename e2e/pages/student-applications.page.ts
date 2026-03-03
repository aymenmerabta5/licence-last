import { expect, type Locator, type Page } from "@playwright/test"

export class StudentApplicationsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/en/dashboard/student/applications")
    await expect(this.page).toHaveURL(/\/en\/dashboard\/student\/applications/)
    await expect(this.page.locator("h1").first()).toBeVisible()
  }

  applicationCard(offerTitle: string): Locator {
    return this.page.locator("article", { hasText: offerTitle }).first()
  }

  async expectApplicationVisible(offerTitle: string): Promise<void> {
    await expect(this.applicationCard(offerTitle)).toBeVisible({ timeout: 15000 })
  }

  async expectStatusText(offerTitle: string, statusPattern: RegExp): Promise<void> {
    await expect(
      this.applicationCard(offerTitle).locator("text=/applied|accepted|rejected|withdrawn|validated/i").first(),
    ).toBeVisible()
    await expect(
      this.applicationCard(offerTitle).getByText(statusPattern).first(),
    ).toBeVisible()
  }

  async withdrawApplication(offerTitle: string): Promise<void> {
    this.page.once("dialog", (dialog) => dialog.accept())
    await this.applicationCard(offerTitle)
      .getByRole("button", { name: /withdraw/i })
      .click()
  }

  async expectWithdrawSuccess(): Promise<void> {
    await expect(
      this.page.getByText(/application withdrawn successfully/i).first(),
    ).toBeVisible({ timeout: 10000 })
  }
}
