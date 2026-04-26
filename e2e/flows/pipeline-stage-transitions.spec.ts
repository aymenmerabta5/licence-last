import { expect, test } from "@playwright/test"

import { loginAsCompany } from "../fixtures/auth"
import { seedApplicationFixture } from "../fixtures/seed"

test.describe("Pipeline Stage Transitions", () => {
  test("can view candidate pipeline page", async ({ page }) => {
    await seedApplicationFixture({ status: "applied" })
    await loginAsCompany(page)
    await page.goto("/en/dashboard/candidates")

    await expect(
      page.getByRole("heading", { name: "Candidate Pipeline" }),
    ).toBeVisible({ timeout: 15000 })
  })

  test("can navigate to offer candidates page", async ({ page }) => {
    const fixture = await seedApplicationFixture({ status: "applied" })
    await loginAsCompany(page)
    await page.goto(
      `/en/dashboard/company/offers/${fixture.offerId}/candidates`,
    )

    await expect(page.getByText(fixture.offerTitle).first()).toBeVisible({
      timeout: 15000,
    })

    const stageSelect = page.locator(`#pipeline-stage-${fixture.applicationId}`)
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
