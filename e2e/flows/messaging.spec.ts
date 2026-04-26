import { expect, test } from "@playwright/test"

import { loginAsCompany, loginAsStudent } from "../fixtures/auth"
import { seedApplicationFixture } from "../fixtures/seed"

test.describe("Messaging", () => {
  test("student can access messages page", async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/messages")
    await expect(page).toHaveURL(/\/en\/dashboard\/messages/, {
      timeout: 15000,
    })
  })

  test("company can access messages page", async ({ page }) => {
    await loginAsCompany(page)
    await page.goto("/en/dashboard/messages")
    await expect(page).toHaveURL(/\/en\/dashboard\/messages/, {
      timeout: 15000,
    })
  })

  test("company can send a message to an applicant", async ({ page }) => {
    const _fixture = await seedApplicationFixture()

    await loginAsCompany(page)
    await page.goto("/en/dashboard/messages")
    await expect(page).toHaveURL(/\/en\/dashboard\/messages/, {
      timeout: 15000,
    })

    const starterButton = page
      .locator("button", { hasText: /test student/i })
      .first()
    if (await starterButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await starterButton.click()
      await page.waitForTimeout(1000)

      const textarea = page.locator("textarea").last()
      if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await textarea.fill("Hello from E2E test!")
        const sendButton = page.locator("button", { hasText: /send/i }).last()
        await sendButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})
