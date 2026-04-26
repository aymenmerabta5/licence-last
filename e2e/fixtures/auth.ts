import type { Page } from "@playwright/test"
import { LoginPage } from "../pages/login.page"
import { TEST_CREDENTIALS, type TestCredential } from "./credentials"

export type UserRole =
  | "student"
  | "company"
  | "admin"
  | "dept_head"
  | "super_admin"

export interface AuthSession {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

async function loginAsCredential(
  page: Page,
  credential: Pick<TestCredential, "email" | "password">,
): Promise<void> {
  const loginPage = new LoginPage(page)
  await loginPage.loginWithCredentials(credential.email, credential.password)
}

/**
 * Creates an authenticated session by logging in through the UI.
 * This should be called in test.setup or beforeEach hooks.
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
    case "dept_head":
      await loginAsDeptHead(page)
      break
    case "super_admin":
      await loginAsSuperAdmin(page)
      break
    default:
      throw new Error(`Unknown role: ${role}`)
  }
}

/**
 * Login as a test student user.
 */
export async function loginAsStudent(page: Page): Promise<void> {
  await loginAsCredential(page, TEST_CREDENTIALS.student)
}

/**
 * Login as a test company admin user.
 */
export async function loginAsCompany(page: Page): Promise<void> {
  await loginAsCredential(page, TEST_CREDENTIALS.companyAdmin)
}

/**
 * Login as a test university admin user.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAsCredential(page, TEST_CREDENTIALS.universityAdmin)
}

/**
 * Login as a test department head user.
 */
export async function loginAsDeptHead(page: Page): Promise<void> {
  await loginAsCredential(page, TEST_CREDENTIALS.deptHead)
}

/**
 * Login as a test super admin user.
 */
export async function loginAsSuperAdmin(page: Page): Promise<void> {
  await loginAsCredential(page, TEST_CREDENTIALS.superAdmin)
}

/**
 * Logout the current user.
 */
export async function logout(page: Page): Promise<void> {
  await page.goto("/api/auth/signout")
  await page.waitForURL("/en/login", { timeout: 5000 })
}

/**
 * Check if user is authenticated by looking for auth-specific elements.
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 })
    return true
  } catch {
    return false
  }
}
