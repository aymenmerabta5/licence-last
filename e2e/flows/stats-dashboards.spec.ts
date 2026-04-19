import { expect, test } from "@playwright/test"

import { loginAsSuperAdmin } from "../fixtures/auth"

test.describe("Stats Dashboards", () => {
  test("can view admin stats dashboard", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/stats")

    await expect(
      page.getByRole("heading", { name: "Platform performance" }),
    ).toBeVisible({ timeout: 15000 })
  })
})
