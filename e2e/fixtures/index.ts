/**
 * E2E Test Fixtures
 *
 * This module exports all test fixtures for E2E testing.
 * Import from this file to access auth helpers and test data utilities.
 */

export {
  type AuthSession,
  createAuthenticatedSession,
  isAuthenticated,
  loginAsAdmin,
  loginAsCompany,
  loginAsDeptHead,
  loginAsStudent,
  loginAsSuperAdmin,
  logout,
  type UserRole,
} from "./auth"

export {
  TEST_CREDENTIALS,
  type TestCredential,
  type TestCredentialKey,
} from "./credentials"

export {
  createTestApplication,
  createTestCompany,
  createTestOffer,
  createTestScenario,
  createTestStudentProfile,
  createTestUser,
  generateId,
  TEST_SKILLS,
  type TestApplicationData,
  type TestCompanyData,
  type TestOfferData,
  type TestStudentProfileData,
  type TestUserData,
  WILAYA_CODES,
} from "./factories"

export {
  resetE2EDatabase,
  seedApplicationFixture,
  seedBaseReferenceData,
  seedOfferFixture,
  seedTestUsers,
  syncE2EDatabaseSchema,
  type SeedBaseReferenceData,
  type SeededApplicationFixture,
  type SeededOfferFixture,
  type SeededTestUsers,
} from "./seed"