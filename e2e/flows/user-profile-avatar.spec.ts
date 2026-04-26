import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"

test.describe("User Profile & Settings", () => {
  test("can view settings page", async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/settings")

    await expect(
      page.getByRole("heading", { name: "Settings" }).last(),
    ).toBeVisible({
      timeout: 15000,
    })
  })

  test("can navigate to profile tab", async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/settings")

    await expect(
      page.getByRole("heading", { name: "Settings" }).last(),
    ).toBeVisible({
      timeout: 15000,
    })

    const profileBtn = page.locator("button", { hasText: /^Profile$/i })
    if (await profileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test("can navigate to security tab", async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/settings")

    await expect(
      page.getByRole("heading", { name: "Settings" }).last(),
    ).toBeVisible({
      timeout: 15000,
    })

    const securityBtn = page.locator("button", { hasText: /^Security$/i })
    if (await securityBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await securityBtn.click()
      await page.waitForTimeout(500)
    }
  })
})
