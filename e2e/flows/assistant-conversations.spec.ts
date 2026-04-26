import { test } from "@playwright/test"

import { loginAsCompany } from "../fixtures/auth"

test.describe("Assistant Conversations", () => {
  test("assistant page loads", async ({ page }) => {
    await loginAsCompany(page)
    await page.goto("/en/dashboard/assistant")

    await page.waitForTimeout(3000)
  })
})
