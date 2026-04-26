import { expect, test } from "@playwright/test"

import { loginAsCompany } from "../fixtures/auth"
import { seedOfferFixture } from "../fixtures/seed"

test.describe("Offer CRUD & Publishing", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCompany(page)
  })

  test("can navigate to offers list page", async ({ page }) => {
    await page.goto("/en/dashboard/company/offers")
    await expect(page.getByText(/offers/i).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test("can create a new offer", async ({ page }) => {
    await page.goto("/en/dashboard/company/offers/new")
    await expect(page.locator("#offer-title")).toBeVisible({ timeout: 15000 })

    await page.fill("#offer-title", "E2E Test Offer")
    await page.fill(
      "#offer-description",
      "An internship offer created by E2E tests",
    )

    const skillButton = page.locator('button:has-text("React")').first()
    await expect(skillButton).toBeVisible({ timeout: 10000 })
    await skillButton.click()

    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/en\/dashboard\/company\/offers/, {
      timeout: 30000,
    })
  })

  test("seeded offer is viewable on company candidates page", async ({
    page,
  }) => {
    const offer = await seedOfferFixture({ titlePrefix: "Listed Offer" })

    await loginAsCompany(page)
    await page.goto(`/en/dashboard/company/offers/${offer.offerId}/candidates`)

    await expect(page.getByText(offer.offerTitle).first()).toBeVisible({
      timeout: 15000,
    })
  })
})
