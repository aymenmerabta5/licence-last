import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"
import { TEST_CREDENTIALS } from "../fixtures/credentials"
import { LoginPage } from "../pages/login.page"

test.describe("Login Flow", () => {
  test("invalid credentials stay on login page", async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await page.fill("#login-email", TEST_CREDENTIALS.student.email)
    await page.fill("#login-password", "WrongPassword123!")
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/en\/login$/)
    await expect(page.getByRole("button", { name: /sign in/i })).toBeEnabled({
      timeout: 20000,
    })
  })

  test("forgot password link navigates to reset-password", async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await page.getByRole("link", { name: /forgot password/i }).click()
    await expect(page).toHaveURL(/\/en\/reset-password$/)
  })

  test("create account link navigates to signup", async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await page.getByRole("link", { name: /create one/i }).click()
    await expect(page).toHaveURL(/\/en\/signup$/)
  })

  test("authenticated user is redirected from login to dashboard", async ({
    page,
  }) => {
    await loginAsStudent(page)

    await page.goto("/en")
    await expect(page).toHaveURL(/\/en\/(dashboard|onboarding)/)
  })
})
