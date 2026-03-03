import { expect, type Page } from "@playwright/test"

export class CompanyCandidatesPage {
  constructor(private readonly page: Page) {}

  async gotoDashboard(): Promise<void> {
    await this.page.goto("/en/dashboard/candidates")
    await expect(this.page).toHaveURL(/\/en\/dashboard\/candidates/)
    await expect(this.page.getByRole("heading", { name: /pipeline/i })).toBeVisible()
  }

  async gotoOfferCandidates(offerId: string): Promise<void> {
    await this.page.goto(`/en/dashboard/company/offers/${offerId}/candidates`)
    await expect(this.page).toHaveURL(
      new RegExp(`/en/dashboard/company/offers/${offerId}/candidates$`),
    )
    await expect(this.page.locator("text=/pipeline/i").first()).toBeVisible()
  }

  async acceptFirstCandidate(): Promise<void> {
    const acceptButton = this.page.getByRole("button", { name: /accept/i }).first()
    await expect(acceptButton).toBeVisible()
    await acceptButton.click()

    const confirmAcceptButton = this.page
      .locator("div.fixed")
      .getByRole("button", { name: /accept/i })
      .last()
    await expect(confirmAcceptButton).toBeVisible()
    await confirmAcceptButton.click()
  }

  async rejectFirstCandidate(): Promise<void> {
    const refuseButton = this.page.getByRole("button", { name: /refuse/i }).first()
    await expect(refuseButton).toBeVisible()
    await refuseButton.click()

    const confirmRefuseButton = this.page
      .getByRole("button", { name: /refuse this candidate/i })
      .first()
    await expect(confirmRefuseButton).toBeVisible()
    await confirmRefuseButton.click()
  }
}