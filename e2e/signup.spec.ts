import type { Page } from "@playwright/test"
import { test, expect } from "@playwright/test"

import { TEST_CREDENTIALS, createTestUser } from "./fixtures/data"

async function openStudentSignupForm(page: Page) {
  await page.goto("/en/signup")

  const studentButton = page.getByRole("button", { name: /student/i }).first()
  await expect(studentButton).toBeVisible()
  await studentButton.click()

  await expect(page.locator("#signup-email")).toBeVisible()
}

async function fillRequiredSignupFields(
  page: Page,
  input: { name: string; email: string; password: string; confirmPassword: string },
) {
  await page.fill("#signup-name", input.name)
  await page.fill("#signup-email", input.email)
  await page.fill("#signup-password", input.password)
  await page.fill("#signup-confirm-password", input.confirmPassword)
  await page.check("#signup-terms")
}

test.describe("Student Signup Flow", () => {
  test("successful signup with valid data", async ({ page }) => {
    const testUser = createTestUser("student")

    await openStudentSignupForm(page)
    await fillRequiredSignupFields(page, {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.password,
    })

    await page.click('button[type="submit"]')

    await expect(
      page.locator("text=/verify your email|check your email|verification/i").first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test("validation error for invalid email format", async ({ page }) => {
    await openStudentSignupForm(page)
    await fillRequiredSignupFields(page, {
      name: "Invalid Email User",
      email: "invalid-email-format",
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
    })

    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/en\/signup/)
    await expect(page.locator("#signup-email")).toHaveValue("invalid-email-format")
  })

  test("validation error for password too short", async ({ page }) => {
    await openStudentSignupForm(page)
    await fillRequiredSignupFields(page, {
      name: "Short Password User",
      email: "short.pass@example.com",
      password: "short",
      confirmPassword: "short",
    })

    await page.click('button[type="submit"]')
    await expect(page.locator("text=/password|at least|minimum/i").first()).toBeVisible()
  })

  test("validation error for mismatched passwords", async ({ page }) => {
    await openStudentSignupForm(page)
    await fillRequiredSignupFields(page, {
      name: "Mismatch Password User",
      email: "mismatch.pass@example.com",
      password: "TestPassword123!",
      confirmPassword: "DifferentPassword123!",
    })

    await page.click('button[type="submit"]')
    await expect(page.locator("text=/passwords do not match|must match/i").first()).toBeVisible()
  })

  test("validation error for existing email", async ({ page }) => {
    await openStudentSignupForm(page)
    await fillRequiredSignupFields(page, {
      name: "Existing User",
      email: TEST_CREDENTIALS.student.email,
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
    })

    await page.click('button[type="submit"]')
    await expect(page.locator("text=/already exists|email taken|account exists/i").first()).toBeVisible({
      timeout: 5000,
    })
  })

  test("role selector is visible and functional", async ({ page }) => {
    await page.goto("/en/signup")

    const studentButton = page.getByRole("button", { name: /student/i }).first()
    const companyButton = page.getByRole("button", { name: /company/i }).first()
    const universityButton = page.getByRole("button", { name: /university/i }).first()

    await expect(studentButton).toBeVisible()
    await expect(companyButton).toBeVisible()
    await expect(universityButton).toBeVisible()

    await studentButton.click()
    await expect(page.locator("#signup-email")).toBeVisible()
  })

  test("can navigate to login page from signup", async ({ page }) => {
    await openStudentSignupForm(page)

    await page.locator('a[href="/en/login"]').first().click()
    await expect(page).toHaveURL("/en/login")
  })

  test("signup form has required fields", async ({ page }) => {
    await openStudentSignupForm(page)

    await expect(page.locator("#signup-name")).toBeVisible()
    await expect(page.locator("#signup-email")).toBeVisible()
    await expect(page.locator("#signup-password")).toBeVisible()
    await expect(page.locator("#signup-confirm-password")).toBeVisible()
    await expect(page.locator("#signup-terms")).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
