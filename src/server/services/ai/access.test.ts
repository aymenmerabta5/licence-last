import { describe, expect, test } from "bun:test"

import { isRoleAllowedForIntent } from "./access"

describe("isRoleAllowedForIntent", () => {
  test("allows company admin by default", () => {
    expect(isRoleAllowedForIntent({ role: "company_admin", intent: null })).toBe(true)
    expect(isRoleAllowedForIntent({ role: "student", intent: null })).toBe(false)
  })

  test("restricts admin validation to admins", () => {
    expect(isRoleAllowedForIntent({ role: "admin", intent: "admin_validation_summary" })).toBe(true)
    expect(isRoleAllowedForIntent({ role: "super_admin", intent: "admin_validation_summary" })).toBe(true)
    expect(isRoleAllowedForIntent({ role: "company_admin", intent: "admin_validation_summary" })).toBe(false)
  })

  test("restricts student intents to students", () => {
    expect(isRoleAllowedForIntent({ role: "student", intent: "student_search_parse" })).toBe(true)
    expect(isRoleAllowedForIntent({ role: "admin", intent: "student_search_parse" })).toBe(false)
  })

  test("allows notifications summary for any authed role", () => {
    expect(isRoleAllowedForIntent({ role: "student", intent: "notifications_summarize" })).toBe(true)
    expect(isRoleAllowedForIntent({ role: "company_admin", intent: "notifications_summarize" })).toBe(true)
    expect(isRoleAllowedForIntent({ role: "admin", intent: "notifications_summarize" })).toBe(true)
  })
})
