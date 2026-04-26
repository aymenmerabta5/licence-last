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
  createFreshCompanyAdminUser,
  createFreshStudentUser,
  resetE2EDatabase,
  restoreUserPassword,
  type SeedBaseReferenceData,
  type SeededApplicationFixture,
  type SeededDocumentFixture,
  type SeededOfferFixture,
  type SeededPlacementFixture,
  type SeededTestUsers,
  seedApplicationFixture,
  seedBaseReferenceData,
  seedGeneratedDocument,
  seedOfferFixture,
  seedPasswordResetToken,
  seedPlacementFixture,
  seedTestUsers,
  syncE2EDatabaseSchema,
} from "./seed"
