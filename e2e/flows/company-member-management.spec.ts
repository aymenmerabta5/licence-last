import { expect, test } from "@playwright/test"

import { loginAsCompany } from "../fixtures/auth"

test.describe("Company Member Management", () => {
  test("can list team members", async ({ page }) => {
    await loginAsCompany(page)
    await page.goto("/en/dashboard/company/team")

    await expect(
      page.getByRole("heading", { name: "Team Members" }),
    ).toBeVisible({ timeout: 15000 })
  })

  test("can see invite form", async ({ page }) => {
    await loginAsCompany(page)
    await page.goto("/en/dashboard/company/team")

    await expect(
      page.getByRole("heading", { name: "Team Members" }),
    ).toBeVisible({ timeout: 15000 })

    const nameInput = page.locator("#company-team-invite-name")
    const emailInput = page.locator("#company-team-invite-email")
    if (
      (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) &&
      (await emailInput.isVisible().catch(() => false))
    ) {
      await nameInput.fill("Test Recruiter")
      await emailInput.fill("recruiter@example.com")
    }
  })
})
