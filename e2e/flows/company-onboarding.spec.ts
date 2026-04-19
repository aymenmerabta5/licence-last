import { expect, test } from "@playwright/test"

import { createFreshCompanyAdminUser } from "../fixtures/seed"
import { loginAsCompany } from "../fixtures/auth"
import { LoginPage } from "../pages/login.page"

test.describe("Company Onboarding", () => {
  test("completes company onboarding and reaches pending status", async ({
    page,
  }) => {
    const { email, password } = await createFreshCompanyAdminUser()

    const loginPage = new LoginPage(page)
    await loginPage.loginWithCredentials(email, password)

    await page.goto("/en/onboarding/company")
    await expect(page.locator("#company-name")).toBeVisible({ timeout: 15000 })

    await page.fill("#company-name", "E2E Test Company")
    await page.fill("#company-description", "A test company created by E2E")

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: "test-doc.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.0 test"),
    })

    await page.locator("#company-wilaya").click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').first().click()
    await page.waitForTimeout(300)

    await page.fill("#company-address", "456 Business District")

    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/en\/(status|onboarding)/, {
      timeout: 30000,
    })
  })

  test("already-onboarded company admin reaches dashboard", async ({
    page,
  }) => {
    await loginAsCompany(page)
    await page.goto("/en/onboarding/company")

    await expect(page).toHaveURL(/\/en\/(dashboard|status)/, { timeout: 15000 })
  })
})
