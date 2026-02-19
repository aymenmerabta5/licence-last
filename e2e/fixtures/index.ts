/**
 * E2E Test Fixtures
 *
 * This module exports all test fixtures for E2E testing.
 * Import from this file to access auth helpers and data factories.
 *
 * @example
 * ```typescript
 * import { createTestUser, loginAsStudent } from "../fixtures"
 * ```
 */

// Auth fixtures
export {
  type AuthSession,
  createAuthenticatedSession,
  isAuthenticated,
  loginAsAdmin,
  loginAsCompany,
  loginAsStudent,
  logout,
  type UserRole,
} from "./auth"

// Data fixtures
export {
  createTestApplication,
  createTestCompany,
  createTestOffer,
  createTestScenario,
  createTestStudentProfile,
  createTestUser,
  generateId,
  TEST_CREDENTIALS,
  TEST_SKILLS,
  type TestApplicationData,
  type TestCompanyData,
  type TestOfferData,
  type TestStudentProfileData,
  type TestUserData,
  WILAYA_CODES,
} from "./data"
