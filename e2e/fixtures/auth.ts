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

async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/en/login")
  await page.waitForSelector("#login-email", {
    state: "visible",
    timeout: 15000,
  })

  await page.fill("#login-email", email)
  await page.fill("#login-password", password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/en\/(dashboard|status|onboarding|verify)/, {
    timeout: 15000,
  })
}

/**
 * Creates an authenticated session by logging in through the UI
 * This should be called in test.setup or beforeEach hooks
 */
export async function createAuthenticatedSession(
  page: Page,
  role: UserRole,
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
  await loginWithCredentials(
    page,
    "test.student@example.com",
    "TestPassword123!",
  )
}

/**
 * Login as a test company admin user
 * Uses test credentials from seeded data
 */
export async function loginAsCompany(page: Page): Promise<void> {
  await loginWithCredentials(
    page,
    "test.company@example.com",
    "TestPassword123!",
  )
}

/**
 * Login as a test admin user
 * Uses test credentials from seeded data
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await loginWithCredentials(page, "test.admin@example.com", "TestPassword123!")
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
