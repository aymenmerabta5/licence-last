import { describe, expect, test } from "bun:test"

import { minimizeAssistantContext } from "./context"

describe("minimizeAssistantContext", () => {
  test("omits student email/phone for admin_validation_summary", () => {
    const out = minimizeAssistantContext({
      intent: "admin_validation_summary",
      application: {
        id: "app_1",
        student: {
          name: "Student Name",
          email: "student@example.com",
          phone: "+213-555-0101",
        },
        profile: {
          level: "L3",
          department: "CS",
          phone: "should-not-leak",
        },
        offer: {
          title: "Frontend Intern",
          internshipType: "summer",
          workMode: "remote",
        },
        company: {
          name: "Acme",
        },
        skills: [{ id: "s1", name: "React", category: "frontend" }],
      },
    })

    const json = JSON.stringify(out)
    expect(json).toContain("admin_validation_summary")
    expect(json).toContain("Student Name")
    expect(json).not.toContain("student@example.com")
    expect(json).not.toContain("+213-555-0101")
    expect(json).not.toContain("should-not-leak")
  })

  test("redacts PII in notifications payload", () => {
    const out = minimizeAssistantContext({
      intent: "notifications_summarize",
      role: "student",
      notifications: [
        {
          id: "n1",
          type: "message",
          createdAt: "2026-02-10T00:00:00.000Z",
          readAt: null,
          payload: {
            email: "student@example.com",
            nested: {
              phone: "555",
            },
          },
        },
      ],
    })

    const json = JSON.stringify(out)
    expect(json).toContain("notifications_summarize")
    expect(json).not.toContain("student@example.com")
    expect(json).not.toContain('"555"')
    expect(json).toContain("[REDACTED]")
  })
})
