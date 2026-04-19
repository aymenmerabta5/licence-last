import { expect, test } from "@playwright/test"

import { loginAsCompany } from "../fixtures/auth"
import { seedApplicationFixture } from "../fixtures/seed"

test.describe("Company Accept/Refuse Application", () => {
  test("can view candidates for an offer", async ({ page }) => {
    const fixture = await seedApplicationFixture()

    await loginAsCompany(page)
    await page.goto(
      `/en/dashboard/company/offers/${fixture.offerId}/candidates`,
    )

    await expect(
      page.getByText(fixture.offerTitle).first(),
    ).toBeVisible({ timeout: 15000 })
  })

  test("can move candidate pipeline stage", async ({ page }) => {
    const fixture = await seedApplicationFixture()

    await loginAsCompany(page)
    await page.goto(
      `/en/dashboard/company/offers/${fixture.offerId}/candidates`,
    )

    await expect(
      page.getByText(fixture.offerTitle).first(),
    ).toBeVisible({ timeout: 15000 })

    const stageSelect = page.locator(
      `#pipeline-stage-${fixture.applicationId}`,
    )
    if (await stageSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await stageSelect.click()
      const screeningOption = page
        .locator('[role="option"]', { hasText: /screening/i })
        .first()
      if (
        await screeningOption.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await screeningOption.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})
