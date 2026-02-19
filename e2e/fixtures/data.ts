import { randomUUID } from "node:crypto"

// Generate a unique timestamp-based suffix for test data uniqueness
function generateUniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

// Generate a random ID
export function generateId(): string {
  return randomUUID()
}

export interface TestUserData {
  id: string
  email: string
  name: string
  password: string
  role: "student" | "company_admin" | "admin"
  emailVerified: boolean
  onboardingCompleted: boolean
}

export interface TestStudentProfileData {
  userId: string
  wilayaCode: number
  bio: string
  phone: string
  githubUrl: string
  portfolioUrl: string
  studentNumber: string
  department: string
  level: string
  address: string
}

export interface TestCompanyData {
  id: string
  name: string
  slug: string
  description: string
  websiteUrl: string
  phone: string
  contactEmail: string
  representativeName: string
  wilayaCode: number
  address: string
  status: "pending" | "approved" | "rejected"
}

export interface TestOfferData {
  id: string
  companyId: string
  title: string
  description: string
  internshipType: "pfe" | "stage" | "alternance"
  workMode: "remote" | "onsite" | "hybrid" | null
  wilayaCode: number
  durationWeeks: number
  maxPositions: number
  status: "draft" | "published" | "closed" | "archived"
}

export interface TestApplicationData {
  id: string
  offerId: string
  studentUserId: string
  status:
    | "applied"
    | "shortlisted"
    | "interview"
    | "accepted"
    | "rejected"
    | "withdrawn"
  pipelineStage:
    | "applied"
    | "screening"
    | "interview"
    | "offer"
    | "hired"
    | "rejected"
  coverLetter: string
}

/**
 * Creates test user data with unique identifiers
 * @param role - The role for the test user
 * @returns Test user data object
 */
export function createTestUser(
  role: "student" | "company_admin" | "admin" = "student",
): TestUserData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    email: `test.${role}.${suffix}@example.com`,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)} ${suffix.slice(-6)}`,
    password: "TestPassword123!",
    role,
    emailVerified: true,
    onboardingCompleted: true,
  }
}

/**
 * Creates test student profile data
 * @param userId - The user ID to associate with the profile
 * @returns Test student profile data
 */
export function createTestStudentProfile(
  userId: string,
): TestStudentProfileData {
  const suffix = generateUniqueSuffix()

  return {
    userId,
    wilayaCode: 16, // Algiers
    bio: `Passionate computer science student looking for internship opportunities. Created at ${suffix}.`,
    phone: "+213555123456",
    githubUrl: "https://github.com/teststudent",
    portfolioUrl: "https://teststudent.dev",
    studentNumber: `STU${suffix.slice(-8)}`,
    department: "Computer Science",
    level: "Master 1",
    address: "123 University Street, Algiers",
  }
}

/**
 * Creates test company data with unique identifiers
 * @returns Test company data object
 */
export function createTestCompany(): TestCompanyData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    name: `Test Company ${suffix.slice(-6)}`,
    slug: `test-company-${suffix}`,
    description: `A test company for E2E testing. Created at ${suffix}. We are a technology company focused on innovation.`,
    websiteUrl: "https://testcompany.example.com",
    phone: "+213555987654",
    contactEmail: `contact.${suffix}@testcompany.example.com`,
    representativeName: `John Doe ${suffix.slice(-4)}`,
    wilayaCode: 16, // Algiers
    address: "456 Business District, Algiers",
    status: "approved",
  }
}

/**
 * Creates test internship offer data
 * @param companyId - The company ID to associate with the offer
 * @returns Test offer data object
 */
export function createTestOffer(companyId: string): TestOfferData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    companyId,
    title: `Software Engineering Intern ${suffix.slice(-6)}`,
    description: `We are looking for a motivated software engineering intern to join our team. 
    
Requirements:
- Knowledge of React and TypeScript
- Good problem-solving skills
- Willingness to learn

This is a test internship offer created at ${suffix}.`,
    internshipType: "pfe",
    workMode: "hybrid",
    wilayaCode: 16, // Algiers
    durationWeeks: 24,
    maxPositions: 2,
    status: "published",
  }
}

/**
 * Creates test application data
 * @param offerId - The offer ID to apply to
 * @param studentUserId - The student user ID making the application
 * @returns Test application data object
 */
export function createTestApplication(
  offerId: string,
  studentUserId: string,
): TestApplicationData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    offerId,
    studentUserId,
    status: "applied",
    pipelineStage: "applied",
    coverLetter: `Dear Hiring Manager,

I am writing to express my interest in this internship position. I believe my skills and enthusiasm make me a strong candidate for this role.

This is a test application created at ${suffix}.

Best regards,
Test Student`,
  }
}

/**
 * Creates a complete test scenario with related entities
 * @returns Object containing all related test data
 */
export function createTestScenario() {
  const student = createTestUser("student")
  const studentProfile = createTestStudentProfile(student.id)
  const companyAdmin = createTestUser("company_admin")
  const company = createTestCompany()
  const offer = createTestOffer(company.id)
  const application = createTestApplication(offer.id, student.id)

  return {
    student,
    studentProfile,
    companyAdmin,
    company,
    offer,
    application,
  }
}

/**
 * Creates test credentials for predefined test accounts
 * These are used in the auth fixtures for consistent login testing
 */
export const TEST_CREDENTIALS = {
  student: {
    email: "test.student@example.com",
    password: "TestPassword123!",
    name: "Test Student",
  },
  company: {
    email: "test.company@example.com",
    password: "TestPassword123!",
    name: "Test Company Admin",
  },
  admin: {
    email: "test.admin@example.com",
    password: "TestPassword123!",
    name: "Test Admin",
  },
} as const

/**
 * Wilaya codes for testing (Algeria)
 */
export const WILAYA_CODES = {
  algiers: 16,
  oran: 31,
  constantine: 25,
  annaba: 23,
  blida: 9,
} as const

/**
 * Common skill tags for testing
 */
export const TEST_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "Git",
  "Docker",
  "AWS",
  "Figma",
] as const
