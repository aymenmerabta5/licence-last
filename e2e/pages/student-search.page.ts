import { expect, type Page } from "@playwright/test"

export class StudentSearchPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/en/dashboard/student/search")
    await expect(this.page).toHaveURL(/\/en\/dashboard\/student\/search/)
    await expect(
      this.page.getByPlaceholder(/search by title or keyword/i),
    ).toBeVisible()
  }

  async searchByKeyword(keyword: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder(
      /search by title or keyword/i,
    )
    await searchInput.fill(keyword)
  }

  async expectOfferVisible(offerId: string): Promise<void> {
    await expect(
      this.page.locator(`a[href*="/dashboard/explore/${offerId}"]`).first(),
    ).toBeVisible({ timeout: 15000 })
  }

  async openSeededOfferDetails(input: {
    offerId: string
    searchToken: string
  }): Promise<void> {
    await this.goto()
    await this.searchByKeyword(input.searchToken)

    const offerLink = this.page
      .locator(`a[href*="/dashboard/explore/${input.offerId}"]`)
      .first()
    await expect(offerLink).toBeVisible({ timeout: 15000 })
    await offerLink.scrollIntoViewIfNeeded()

    const offerHref = await offerLink.getAttribute("href")
    await offerLink.click()

    const offerUrlPattern = new RegExp(
      `/en/dashboard/(explore|student/offers)/${input.offerId}$`,
    )

    try {
      await expect(this.page).toHaveURL(offerUrlPattern, { timeout: 15000 })
    } catch (error) {
      if (!offerHref) {
        throw error
      }

      await this.page.goto(offerHref)
      await expect(this.page).toHaveURL(offerUrlPattern)
    }
  }

  async clickApplyNow(): Promise<void> {
    const applyButton = this.page
      .getByRole("button", { name: /apply now/i })
      .first()
    await expect(applyButton).toBeVisible()
    await applyButton.click()
  }

  async fillCoverLetter(coverLetter: string): Promise<void> {
    const coverLetterField = this.page.locator("#coverLetter")
    await expect(coverLetterField).toBeVisible()
    await coverLetterField.fill(coverLetter)
  }

  async submitApplication(): Promise<void> {
    await this.page.getByRole("button", { name: /submit application/i }).click()
  }

  async expectApplicationSubmitted(): Promise<void> {
    await expect(
      this.page.getByText(/application submitted successfully/i).first(),
    ).toBeVisible({ timeout: 10000 })
  }
}
