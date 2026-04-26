import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"

test.describe("Notifications", () => {
  test("can view notifications page", async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/notifications")

    await expect(
      page.getByRole("heading", { name: "Notifications" }).last(),
    ).toBeVisible({ timeout: 15000 })
  })

  test("shows mark all read button", async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/notifications")

    await expect(
      page.getByRole("heading", { name: "Notifications" }).last(),
    ).toBeVisible({ timeout: 15000 })

    const markAllBtn = page.locator("button", { hasText: /Mark all read/i })
    await expect(markAllBtn).toBeVisible({ timeout: 5000 })
  })
})
