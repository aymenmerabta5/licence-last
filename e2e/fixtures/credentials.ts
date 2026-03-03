export interface TestCredential {
  email: string
  password: string
  name: string
  role:
    | "student"
    | "company_admin"
    | "university_admin"
    | "dept_head"
    | "super_admin"
}

export const TEST_CREDENTIALS = {
  student: {
    email: "test.student@example.com",
    password: "TestPassword123!",
    name: "Test Student",
    role: "student",
  },
  companyAdmin: {
    email: "test.company@example.com",
    password: "TestPassword123!",
    name: "Test Company Admin",
    role: "company_admin",
  },
  universityAdmin: {
    email: "test.admin@example.com",
    password: "TestPassword123!",
    name: "Test University Admin",
    role: "university_admin",
  },
  deptHead: {
    email: "test.dept-head@example.com",
    password: "TestPassword123!",
    name: "Test Department Head",
    role: "dept_head",
  },
  superAdmin: {
    email: "test.super-admin@example.com",
    password: "TestPassword123!",
    name: "Test Super Admin",
    role: "super_admin",
  },
} as const satisfies Record<string, TestCredential>

export type TestCredentialKey = keyof typeof TEST_CREDENTIALS