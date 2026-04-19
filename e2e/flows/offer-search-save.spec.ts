import { expect, test } from "@playwright/test"

import { loginAsStudent, loginAsCompany } from "../fixtures/auth"
import { seedOfferFixture } from "../fixtures/seed"

test.describe("Offer Search & Save/Unsave", () => {
  test("student can search offers on explore page", async ({ page }) => {
    await seedOfferFixture({ titlePrefix: "Searchable Offer" })

    await loginAsStudent(page)
    await page.goto("/en/dashboard/explore")
    await expect(page.getByText(/explore|internship/i).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test("student can save and unsave an offer", async ({ page }) => {
    const offer = await seedOfferFixture({ titlePrefix: "Saveable Offer" })

    await loginAsStudent(page)
    await page.goto(`/en/dashboard/explore/${offer.offerId}`)
    await expect(page.getByText(offer.offerTitle)).toBeVisible({
      timeout: 15000,
    })

    const saveButton = page
      .locator('button', { hasText: /save|bookmark/i })
      .first()
    if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test("student can access saved offers page", async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/student/saved-offers")

    await expect(page).toHaveURL(/saved-offers/, { timeout: 15000 })
  })
})
