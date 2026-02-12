import type { Page } from "@playwright/test"

export type UserRole = "student" | "company" | "admin"

export interface AuthSession {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

/**
 * Creates an authenticated session by logging in through the UI
 * This should be called in test.setup or beforeEach hooks
 */
export async function createAuthenticatedSession(
  page: Page,
  role: UserRole
): Promise<void> {
  switch (role) {
    case "student":
      await loginAsStudent(page)
      break
    case "company":
      await loginAsCompany(page)
      break
    case "admin":
      await loginAsAdmin(page)
      break
    default:
      throw new Error(`Unknown role: ${role}`)
  }
}

/**
 * Login as a test student user
 * Uses test credentials from seeded data
 */
export async function loginAsStudent(page: Page): Promise<void> {
  await page.goto("/en/login")
  
  // Wait for form to be ready
  await page.waitForSelector('input[type="email"]', { state: "visible" })
  
  // Fill in test student credentials
  // These match the seeded test data in global.setup.ts
  await page.fill('input[type="email"]', "test.student@example.com")
  await page.fill('input[type="password"]', "TestPassword123!")
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for navigation to complete (redirect to dashboard)
  await page.waitForURL("**/dashboard/**", { timeout: 10000 })
}

/**
 * Login as a test company admin user
 * Uses test credentials from seeded data
 */
export async function loginAsCompany(page: Page): Promise<void> {
  await page.goto("/en/login")
  
  // Wait for form to be ready
  await page.waitForSelector('input[type="email"]', { state: "visible" })
  
  // Fill in test company credentials
  await page.fill('input[type="email"]', "test.company@example.com")
  await page.fill('input[type="password"]', "TestPassword123!")
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for navigation to complete
  await page.waitForURL("**/dashboard/**", { timeout: 10000 })
}

/**
 * Login as a test admin user
 * Uses test credentials from seeded data
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/en/login")
  
  // Wait for form to be ready
  await page.waitForSelector('input[type="email"]', { state: "visible" })
  
  // Fill in test admin credentials
  await page.fill('input[type="email"]', "test.admin@example.com")
  await page.fill('input[type="password"]', "TestPassword123!")
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for navigation to complete
  await page.waitForURL("**/admin/**", { timeout: 10000 })
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  // Navigate to logout or click logout button
  // Adjust selector based on your UI
  await page.goto("/api/auth/signout")
  await page.waitForURL("/en/login", { timeout: 5000 })
}

/**
 * Check if user is authenticated by looking for auth-specific elements
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Look for a dashboard element or user menu that only appears when logged in
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 })
    return true
  } catch {
    return false
  }
}
