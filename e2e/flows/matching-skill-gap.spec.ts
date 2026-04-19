import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"
import { seedOfferFixture } from "../fixtures/seed"

test.describe("Matching & Skill Gap", () => {
  test("can view offer detail page", async ({ page }) => {
    const { offerId, offerTitle } = await seedOfferFixture()
    await loginAsStudent(page)
    await page.goto(`/en/dashboard/explore/${offerId}`)

    await expect(page.getByText(offerTitle)).toBeVisible({ timeout: 15000 })
  })
})
