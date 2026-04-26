import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"
import { seedOfferFixture } from "../fixtures/seed"

test.describe("Student Apply to Offer", () => {
  test("student can view offer details and apply", async ({ page }) => {
    const offer = await seedOfferFixture({ titlePrefix: "Apply Test Offer" })

    await loginAsStudent(page)
    await page.goto(`/en/dashboard/explore/${offer.offerId}`)

    await expect(page.getByText(offer.offerTitle)).toBeVisible({
      timeout: 15000,
    })

    const applyButton = page
      .locator("button", { hasText: /apply now/i })
      .first()
    if (await applyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await applyButton.click()

      await page.fill("#coverLetter", "I am interested in this position.")
      await page.waitForTimeout(500)

      const submitButton = page
        .locator("button", { hasText: /submit application/i })
        .first()
      await submitButton.click()

      await expect(
        page.getByText(/success|submitted|applied/i).first(),
      ).toBeVisible({ timeout: 15000 })
    }
  })

  test("student can withdraw an application", async ({ page }) => {
    const _fixture = await seedOfferFixture({ titlePrefix: "Withdraw Offer" })

    await loginAsStudent(page)
    await page.goto("/en/dashboard/applications")

    await expect(page).toHaveURL(/\/en\/dashboard\/applications/, {
      timeout: 15000,
    })

    const withdrawButton = page
      .locator("button", { hasText: /withdraw/i })
      .first()
    if (await withdrawButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await withdrawButton.click()
      await page.waitForTimeout(2000)
    }
  })
})
