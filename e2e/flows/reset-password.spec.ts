import { expect, test } from "@playwright/test"

import { TEST_CREDENTIALS } from "../fixtures/credentials"
import { restoreUserPassword, seedPasswordResetToken } from "../fixtures/seed"
import { LoginPage } from "../pages/login.page"
import { ResetPasswordPage } from "../pages/reset-password.page"
import { ResetPasswordVerifyPage } from "../pages/reset-password-verify.page"

test.describe("Forgot Password Flow", () => {
  test("reset password page renders correctly", async ({ page }) => {
    const resetPage = new ResetPasswordPage(page)

    await resetPage.goto()

    await expect(page.getByText("Reset Password").first()).toBeVisible()
    await expect(page.locator("#reset-email")).toBeVisible()
    await expect(
      page.getByRole("button", { name: /send reset link/i }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /back to sign in/i }),
    ).toBeVisible()
  })

  test("shows validation error for empty email on submit", async ({ page }) => {
    const resetPage = new ResetPasswordPage(page)

    await resetPage.goto()
    await resetPage.submit()

    await expect(
      page.getByText(/please enter a valid email address/i).first(),
    ).toBeVisible()
  })

  test("shows validation error for invalid email format", async ({ page }) => {
    const resetPage = new ResetPasswordPage(page)

    await resetPage.goto()
    await resetPage.fillEmail("invalid-email")
    await resetPage.submit()

    await expect(
      page.getByText(/please enter a valid email address/i).first(),
    ).toBeVisible()
  })

  test("handles submission with existing user email", async ({ page }) => {
    const resetPage = new ResetPasswordPage(page)

    await resetPage.goto()
    await resetPage.fillEmail(TEST_CREDENTIALS.student.email)
    await resetPage.submit()

    await resetPage.waitForAnyResult()
    await expect(page).toHaveURL(/\/en\/reset-password/)
  })

  test("shows success for non-existing email (security)", async ({ page }) => {
    const resetPage = new ResetPasswordPage(page)

    await resetPage.goto()
    await resetPage.fillEmail("nonexistent.user@example.com")
    await resetPage.submit()

    await resetPage.waitForSuccessMessage()
  })

  test("back to login link navigates correctly", async ({ page }) => {
    const resetPage = new ResetPasswordPage(page)

    await resetPage.goto()
    await resetPage.goToLoginPage()

    await expect(page).toHaveURL(/\/en\/login$/)
  })

  test("forgot password link on login navigates to reset-password", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await page.getByRole("link", { name: /forgot password/i }).click()

    await expect(page).toHaveURL(/\/en\/reset-password$/)
    await expect(page.locator("#reset-email")).toBeVisible()
  })
})

test.describe("Reset Password Verify Flow", () => {
  test("submit button is disabled without a token", async ({ page }) => {
    const verifyPage = new ResetPasswordVerifyPage(page)

    await verifyPage.goto()

    await expect(
      page.getByRole("button", { name: /set password/i }),
    ).toBeDisabled()
  })

  test("shows error with INVALID_TOKEN query parameter", async ({ page }) => {
    await page.goto("/en/reset-password/verify?error=INVALID_TOKEN")

    await expect(page.getByText(/invalid or has expired/i)).toBeVisible({
      timeout: 15000,
    })
  })

  test("shows error when submitting with invalid token", async ({ page }) => {
    const verifyPage = new ResetPasswordVerifyPage(page)

    await verifyPage.goto("definitely-not-a-real-token-abc123")
    await verifyPage.fillNewPassword("ValidPassword123!")
    await verifyPage.fillConfirmPassword("ValidPassword123!")
    await verifyPage.submit()

    await expect(
      page
        .getByText(/invalid or has expired|could not reset password/i)
        .first(),
    ).toBeVisible({ timeout: 15000 })
  })

  test("shows validation error for empty password", async ({ page }) => {
    const token = await seedPasswordResetToken({
      email: TEST_CREDENTIALS.student.email,
    })

    const verifyPage = new ResetPasswordVerifyPage(page)
    await verifyPage.goto(token)
    await verifyPage.submit()

    await expect(page.getByText(/password is required/i).first()).toBeVisible()
  })

  test("shows validation error for password too short", async ({ page }) => {
    const token = await seedPasswordResetToken({
      email: TEST_CREDENTIALS.student.email,
    })

    const verifyPage = new ResetPasswordVerifyPage(page)
    await verifyPage.goto(token)
    await verifyPage.fillNewPassword("short")
    await verifyPage.fillConfirmPassword("short")
    await verifyPage.submit()

    await expect(page.getByText(/at least 8 characters/i).first()).toBeVisible()
  })

  test("shows validation error for mismatched passwords", async ({ page }) => {
    const token = await seedPasswordResetToken({
      email: TEST_CREDENTIALS.student.email,
    })

    const verifyPage = new ResetPasswordVerifyPage(page)
    await verifyPage.goto(token)
    await verifyPage.fillNewPassword("ValidPassword123!")
    await verifyPage.fillConfirmPassword("DifferentPassword456!")
    await verifyPage.submit()

    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test("successfully resets password with valid token", async ({ page }) => {
    const newPassword = "NewTestPassword456!"
    const token = await seedPasswordResetToken({
      email: TEST_CREDENTIALS.student.email,
    })

    try {
      const verifyPage = new ResetPasswordVerifyPage(page)
      await verifyPage.goto(token)
      await verifyPage.fillNewPassword(newPassword)
      await verifyPage.fillConfirmPassword(newPassword)
      await verifyPage.submit()

      await verifyPage.waitForSuccessMessage()

      await expect(page.locator("#new-password")).not.toBeVisible()
      await expect(page.locator("#confirm-new-password")).not.toBeVisible()
    } finally {
      await restoreUserPassword({
        email: TEST_CREDENTIALS.student.email,
        password: TEST_CREDENTIALS.student.password,
      })
    }
  })

  test("full flow: reset password then login with new password", async ({
    page,
  }) => {
    const newPassword = "FullFlowPassword789!"
    const token = await seedPasswordResetToken({
      email: TEST_CREDENTIALS.student.email,
    })

    try {
      const verifyPage = new ResetPasswordVerifyPage(page)
      await verifyPage.goto(token)
      await verifyPage.fillNewPassword(newPassword)
      await verifyPage.fillConfirmPassword(newPassword)
      await verifyPage.submit()

      await verifyPage.waitForSuccessMessage()

      const loginPage = new LoginPage(page)
      await loginPage.loginWithCredentials(
        TEST_CREDENTIALS.student.email,
        newPassword,
      )

      await expect(page).toHaveURL(/\/en\/(dashboard|onboarding)/)
    } finally {
      await restoreUserPassword({
        email: TEST_CREDENTIALS.student.email,
        password: TEST_CREDENTIALS.student.password,
      })
    }
  })

  test("verify page has back to login link", async ({ page }) => {
    const verifyPage = new ResetPasswordVerifyPage(page)

    await verifyPage.goto()
    await verifyPage.goToLoginPage()

    await expect(page).toHaveURL(/\/en\/login$/)
  })
})
