import { expect, test } from "@playwright/test"

import { loginAsSuperAdmin } from "../fixtures/auth"

test.describe("Company Verification Document", () => {
  test("can view company validation page", async ({ page }) => {
    await loginAsSuperAdmin(page)
    await page.goto("/en/dashboard/admin/companies")

    await expect(
      page.getByRole("heading", { name: "Company Validation" }),
    ).toBeVisible({ timeout: 15000 })
  })
})
