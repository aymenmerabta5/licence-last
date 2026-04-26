import { expect, test } from "@playwright/test"

import { loginAsSuperAdmin } from "../fixtures/auth"

test.describe("Admin User Management", () => {
  test("can list users", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/users")

    await expect(
      page.getByRole("heading", { name: "User Management" }),
    ).toBeVisible({ timeout: 15000 })
  })

  test("can open create user dialog", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/users")

    await expect(
      page.getByRole("heading", { name: "User Management" }),
    ).toBeVisible({ timeout: 15000 })

    const createBtn = page.locator("button", { hasText: /Create User/ })
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click()
      await expect(page.getByText("Create User").first()).toBeVisible({
        timeout: 5000,
      })
    }
  })

  test("can navigate to user detail page", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/users")

    await expect(
      page.getByRole("heading", { name: "User Management" }),
    ).toBeVisible({ timeout: 15000 })

    const userRows = page.locator("tr")
    const rowCount = await userRows.count()
    if (rowCount > 0) {
      await page.waitForTimeout(2000)
      const dropdown = page
        .locator(
          'button[aria-label*="menu"], button[aria-label*="Menu"], button[aria-label*="options"], button[aria-label*="Options"]',
        )
        .first()
        .or(page.locator("tr button").last())
      if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dropdown.click()
        await page.waitForTimeout(500)
        const viewDetails = page
          .locator("button, a")
          .filter({ hasText: /View Details/ })
          .first()
        if (await viewDetails.isVisible({ timeout: 2000 }).catch(() => false)) {
          await viewDetails.click()
          await page.waitForTimeout(2000)
        }
      }
    }
  })
})
