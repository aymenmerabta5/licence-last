import { describe, test, expect } from "bun:test"

import { isRoleAllowedForIntent } from "./access"

describe("access", () => {
  describe("isRoleAllowedForIntent", () => {
    test("allows admin for admin_validation_summary", () => {
      expect(isRoleAllowedForIntent({ role: "university_admin", intent: "admin_validation_summary" })).toBe(true)
      expect(isRoleAllowedForIntent({ role: "super_admin", intent: "admin_validation_summary" })).toBe(true)
    })

    test("denies non-admin for admin_validation_summary", () => {
      expect(isRoleAllowedForIntent({ role: "student", intent: "admin_validation_summary" })).toBe(false)
      expect(isRoleAllowedForIntent({ role: "company_admin", intent: "admin_validation_summary" })).toBe(false)
    })

    test("allows student for student intents", () => {
      expect(isRoleAllowedForIntent({ role: "student", intent: "student_search_parse" })).toBe(true)
      expect(isRoleAllowedForIntent({ role: "student", intent: "student_cover_letter_draft" })).toBe(true)
    })

    test("denies non-student for student intents", () => {
      expect(isRoleAllowedForIntent({ role: "company_admin", intent: "student_search_parse" })).toBe(false)
      expect(isRoleAllowedForIntent({ role: "university_admin", intent: "student_cover_letter_draft" })).toBe(false)
    })

    test("allows all roles for notifications_summarize", () => {
      expect(isRoleAllowedForIntent({ role: "student", intent: "notifications_summarize" })).toBe(true)
      expect(isRoleAllowedForIntent({ role: "company_admin", intent: "notifications_summarize" })).toBe(true)
      expect(isRoleAllowedForIntent({ role: "university_admin", intent: "notifications_summarize" })).toBe(true)
    })

    test("denies when role is null or undefined", () => {
      expect(isRoleAllowedForIntent({ role: null, intent: "offer_generate_draft" })).toBe(false)
      expect(isRoleAllowedForIntent({ role: undefined, intent: "offer_generate_draft" })).toBe(false)
    })

    test("defaults to company_admin for null intent", () => {
      expect(isRoleAllowedForIntent({ role: "company_admin", intent: null })).toBe(true)
      expect(isRoleAllowedForIntent({ role: "student", intent: null })).toBe(false)
    })

    test("defaults to company_admin for missing intent", () => {
      expect(isRoleAllowedForIntent({ role: "company_admin", intent: "nonexistent_intent" })).toBe(true)
    })
  })
})
