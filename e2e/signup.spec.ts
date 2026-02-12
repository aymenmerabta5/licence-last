import { test, expect } from "@playwright/test"
import { createTestUser, TEST_CREDENTIALS } from "./fixtures/data"

test.describe("Student Signup Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page before each test
    await page.goto("/en/signup")
  })

  test("successful signup with valid data", async ({ page }) => {
    const testUser = createTestUser("student")

    // Fill in the signup form
    await page.fill('input[type="email"]', testUser.email)
    await page.fill('input[type="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)

    // Submit the form
    await page.click('button[type="submit"]')

    // Should redirect to email verification page or login
    await expect(page).toHaveURL(/.*(verify-email|login).*/, { timeout: 10000 })

    // Verify success message is shown
    const successMessage = page.locator("text=/check your email|verification|success/i")
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 })
  })

  test("validation error for invalid email format", async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[type="email"]', "invalid-email-format")
    await page.fill('input[type="password"]', "TestPassword123!")
    await page.fill('input[name="confirmPassword"]', "TestPassword123!")

    // Submit the form
    await page.click('button[type="submit"]')

    // Should stay on signup page
    await expect(page).toHaveURL("/en/signup")

    // Should show validation error
    const errorMessage = page.locator("text=/invalid email|email invalid/i")
    await expect(errorMessage.first()).toBeVisible()
  })

  test("validation error for password too short", async ({ page }) => {
    const testUser = createTestUser("student")

    // Fill in valid email but short password
    await page.fill('input[type="email"]', testUser.email)
    await page.fill('input[type="password"]', "short")
    await page.fill('input[name="confirmPassword"]', "short")

    // Submit the form
    await page.click('button[type="submit"]')

    // Should stay on signup page
    await expect(page).toHaveURL("/en/signup")

    // Should show password validation error
    const errorMessage = page.locator("text=/password must be|at least|minimum/i")
    await expect(errorMessage.first()).toBeVisible()
  })

  test("validation error for mismatched passwords", async ({ page }) => {
    const testUser = createTestUser("student")

    // Fill in form with mismatched passwords
    await page.fill('input[type="email"]', testUser.email)
    await page.fill('input[type="password"]', "TestPassword123!")
    await page.fill('input[name="confirmPassword"]', "DifferentPassword123!")

    // Submit the form
    await page.click('button[type="submit"]')

    // Should stay on signup page
    await expect(page).toHaveURL("/en/signup")

    // Should show password mismatch error
    const errorMessage = page.locator("text=/passwords do not match|must match/i")
    await expect(errorMessage.first()).toBeVisible()
  })

  test("validation error for existing email", async ({ page }) => {
    // Try to signup with existing test user email
    await page.fill('input[type="email"]', TEST_CREDENTIALS.student.email)
    await page.fill('input[type="password"]', "TestPassword123!")
    await page.fill('input[name="confirmPassword"]', "TestPassword123!")

    // Submit the form
    await page.click('button[type="submit"]')

    // Should show error about existing user
    const errorMessage = page.locator("text=/already exists|email taken|account exists/i")
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 })
  })

  test("role selector is visible and functional", async ({ page }) => {
    // Check that role selector exists
    const roleSelector = page.locator('[data-testid="role-selector"], [name="role"], text=/student|company/i').first()
    
    // Role selection should be present (either visible or interactive)
    await expect(roleSelector).toBeVisible()
  })

  test("can navigate to login page from signup", async ({ page }) => {
    // Click on login link
    const loginLink = page.locator('a[href="/en/login"], text=/sign in|login|already have/i').first()
    await loginLink.click()

    // Should navigate to login page
    await expect(page).toHaveURL("/en/login")
  })

  test("signup form has required fields", async ({ page }) => {
    // Check that all required fields exist
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
