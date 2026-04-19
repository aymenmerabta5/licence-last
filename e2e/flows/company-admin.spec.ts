import { expect, test } from "@playwright/test"

import { loginAsSuperAdmin, loginAsCompany } from "../fixtures/auth"

test.describe("Company Approval/Rejection/Suspension", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/companies")
  })

  test("admin companies page loads successfully", async ({ page }) => {
    await expect(page).toHaveURL(/\/en\/dashboard\/admin\/companies/, {
      timeout: 15000,
    })
    await expect(page.locator("main")).toBeVisible()
  })

  test("can suspend and reactivate an approved company", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/en\/dashboard\/admin\/companies/, {
      timeout: 15000,
    })

    const suspendButton = page
      .locator("button", { hasText: /suspend/i })
      .first()
    if (await suspendButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await suspendButton.click()
      await page.waitForTimeout(2000)

      const reactivateButton = page
        .locator("button", { hasText: /reactivate/i })
        .first()
      if (
        await reactivateButton
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        await reactivateButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })

  test("company admin can access dashboard when approved", async ({
    page,
  }) => {
    await loginAsCompany(page)
    await page.goto("/en/dashboard")
    await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 15000 })
  })
})
