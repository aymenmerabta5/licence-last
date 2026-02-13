import { describe, test, expect } from "bun:test"

import { getPostLoginRedirectPath } from "./post-login-redirect"

import type { MeResult } from "@/server/services/users/get-me"

function baseMe(): MeResult {
  return {
    user: {
      id: "user-1",
      email: "user-1@example.com",
      role: "student",
      name: null,
      image: null,
      onboardingCompleted: false,
    },
    company: null,
  }
}

describe("src/lib/post-login-redirect", () => {
  describe("getPostLoginRedirectPath", () => {
    test("should redirect non-onboarded students to student onboarding", () => {
      const me = baseMe()
      expect(getPostLoginRedirectPath(me)).toBe("/onboarding/student")
    })

    test("should redirect onboarded students to student dashboard", () => {
      const me: MeResult = {
        ...baseMe(),
        user: { ...baseMe().user, onboardingCompleted: true },
      }
      expect(getPostLoginRedirectPath(me)).toBe("/dashboard/student")
    })

    test("should redirect company admins who are not onboarded to onboarding", () => {
      const me: MeResult = {
        ...baseMe(),
        user: { ...baseMe().user, role: "company_admin", onboardingCompleted: false },
      }
      expect(getPostLoginRedirectPath(me)).toBe("/onboarding/company")
    })

    test("should redirect company admins with approved company to company dashboard", () => {
      const me: MeResult = {
        ...baseMe(),
        user: { ...baseMe().user, role: "company_admin", onboardingCompleted: true },
        company: { id: "c1", name: "Acme", slug: "acme", status: "approved" },
      }
      expect(getPostLoginRedirectPath(me)).toBe("/dashboard/company")
    })

    test("should redirect company admins with rejected company to rejected page", () => {
      const me: MeResult = {
        ...baseMe(),
        user: { ...baseMe().user, role: "company_admin", onboardingCompleted: true },
        company: { id: "c1", name: "Acme", slug: "acme", status: "rejected" },
      }
      expect(getPostLoginRedirectPath(me)).toBe("/dashboard/company/rejected")
    })

    test("should redirect company admins to pending page for other cases", () => {
      const me: MeResult = {
        ...baseMe(),
        user: { ...baseMe().user, role: "company_admin", onboardingCompleted: true },
        company: null,
      }
      expect(getPostLoginRedirectPath(me)).toBe("/dashboard/company/pending")
    })

    test("should redirect admins and super admins to admin dashboard", () => {
      const adminMe: MeResult = {
        ...baseMe(),
        user: { ...baseMe().user, role: "admin", onboardingCompleted: true },
      }
      const superAdminMe: MeResult = {
        ...baseMe(),
        user: { ...baseMe().user, role: "super_admin", onboardingCompleted: true },
      }

      expect(getPostLoginRedirectPath(adminMe)).toBe("/dashboard/admin")
      expect(getPostLoginRedirectPath(superAdminMe)).toBe("/dashboard/admin")
    })

    test("should fall back to / for unknown roles", () => {
      const me = {
        ...baseMe(),
        user: { ...baseMe().user, role: "unknown_role" },
      } as unknown as MeResult

      expect(getPostLoginRedirectPath(me)).toBe("/")
    })
  })
})

