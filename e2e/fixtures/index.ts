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
  createAuthenticatedSession,
  loginAsStudent,
  loginAsCompany,
  loginAsAdmin,
  logout,
  isAuthenticated,
  type UserRole,
  type AuthSession,
} from "./auth"

// Data fixtures
export {
  generateId,
  createTestUser,
  createTestStudentProfile,
  createTestCompany,
  createTestOffer,
  createTestApplication,
  createTestScenario,
  TEST_CREDENTIALS,
  WILAYA_CODES,
  TEST_SKILLS,
  type TestUserData,
  type TestStudentProfileData,
  type TestCompanyData,
  type TestOfferData,
  type TestApplicationData,
} from "./data"
