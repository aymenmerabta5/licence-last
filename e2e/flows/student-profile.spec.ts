import { expect, test } from "@playwright/test"

import { createFreshStudentUser } from "../fixtures/seed"
import { TEST_CREDENTIALS } from "../fixtures/credentials"
import { loginAsStudent } from "../fixtures/auth"
import { LoginPage } from "../pages/login.page"

test.describe("Student Profile Completion", () => {
  test("completes student onboarding from scratch", async ({ page }) => {
    const { email, password } = await createFreshStudentUser()

    const loginPage = new LoginPage(page)
    await loginPage.loginWithCredentials(email, password)

    await page.goto("/en/onboarding/student")
    await expect(page.locator("#student-bio")).toBeVisible({ timeout: 15000 })

    await page.fill("#student-bio", "E2E test student bio")
    await page.fill("#student-phone", "+213555000000")

    const skillButton = page.getByRole("button", { name: "React", exact: true }).first()
    await expect(skillButton).toBeVisible({ timeout: 10000 })
    await skillButton.click()

    await page.locator('button[type="submit"]').last().click()

    await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 30000 })
  })

  test("onboarding redirects already-onboarded student to dashboard", async ({
    page,
  }) => {
    await loginAsStudent(page)

    await page.goto("/en/onboarding/student")

    await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 15000 })
  })
})

test.describe("Student Settings — Profile Edit", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/settings")
    await expect(page.locator("#settings-full-name")).toBeVisible({
      timeout: 15000,
    })
  })

  test("settings page loads profile tab by default", async ({ page }) => {
    await expect(page.locator("#settings-full-name")).toBeVisible()
    await expect(page.locator("#settings-bio")).toBeVisible()
    await expect(page.locator("#settings-department")).toBeVisible()
  })

  test("can update name and bio", async ({ page }) => {
    await page.fill("#settings-full-name", "Updated Test Student")
    await page.fill("#settings-bio", "Updated bio from E2E test")

    await page
      .getByRole("button", { name: /save changes/i })
      .click()

    await expect(page.locator("#settings-full-name")).toHaveValue(
      "Updated Test Student",
      { timeout: 15000 },
    )
  })

  test("can discard changes", async ({ page }) => {
    const originalName = await page
      .locator("#settings-full-name")
      .inputValue()

    await page.fill("#settings-full-name", "Temporary Name")
    await page.getByRole("button", { name: /discard/i }).click()

    await expect(page.locator("#settings-full-name")).toHaveValue(originalName)
  })
})

test.describe("Student Settings — Skills Manager", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/settings")
    await expect(page.locator("#skill-search")).toBeVisible({ timeout: 15000 })
  })

  test("can search and toggle skills", async ({ page }) => {
    await page.fill("#skill-search", "Python")

    const pythonButton = page
      .locator('button:has-text("Python")')
      .first()
    await expect(pythonButton).toBeVisible({ timeout: 10000 })
    await pythonButton.click()

    const saveButton = page.locator('button', { hasText: /commit skills/i })
    await expect(saveButton).toBeEnabled({ timeout: 10000 })
    await saveButton.click()

    await expect(saveButton).toBeDisabled({ timeout: 10000 })
  })
})
