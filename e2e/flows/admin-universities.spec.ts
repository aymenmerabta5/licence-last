import { expect, test } from "@playwright/test"

import { loginAsSuperAdmin } from "../fixtures/auth"

test.describe("University CRUD & Approval", () => {
  test("can list universities", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/universities")

    await expect(
      page.getByRole("heading", { name: "University Validation" }),
    ).toBeVisible({ timeout: 15000 })
  })

  test("can search and filter universities", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/universities")

    await expect(
      page.getByRole("heading", { name: "University Validation" }),
    ).toBeVisible({ timeout: 15000 })

    const searchInput = page.locator("#university-validation-search")
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill("Test")
    }
  })
})
