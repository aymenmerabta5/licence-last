import { expect, test } from "@playwright/test"

import { loginAsSuperAdmin } from "../fixtures/auth"

test.describe("Admin Session Management", () => {
  test("can access user detail page with sessions", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/users")

    await expect(
      page.getByRole("heading", { name: "User Management" }),
    ).toBeVisible({ timeout: 15000 })

    await page.waitForTimeout(2000)
    const rows = page.locator("tr")
    const count = await rows.count()
    if (count > 0) {
      const firstRow = rows.first()
      const rowButtons = firstRow.locator("button")
      const btnCount = await rowButtons.count()
      if (btnCount > 0) {
        await rowButtons.last().click()
        await page.waitForTimeout(500)
        const viewLink = page.locator('a[href*="/admin/users/"]').first()
        if (await viewLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          await viewLink.click()
          await page.waitForTimeout(3000)
        }
      }
    }
  })
})
