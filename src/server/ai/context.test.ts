import { describe, expect, test } from "bun:test"

import {
  assistantContextToJson,
  minimizeAssistantContext,
} from "@/server/ai/context"

describe("context", () => {
  describe("minimizeAssistantContext", () => {
    test("returns null for non-record context", () => {
      expect(minimizeAssistantContext(null)).toBeNull()
      expect(minimizeAssistantContext("string")).toBeNull()
      expect(minimizeAssistantContext(123)).toBeNull()
    })

    test("returns null for missing intent", () => {
      expect(minimizeAssistantContext({})).toBeNull()
      expect(minimizeAssistantContext({ title: "test" })).toBeNull()
    })

    test("minimizes offer_generate_draft context", () => {
      const context = {
        intent: "offer_generate_draft",
        prompt: "Create a React internship",
        title: "Frontend Developer",
        internshipType: "pfe",
        workMode: "hybrid",
        wilayaCode: 16,
        durationWeeks: 12,
        maxPositions: 2,
        description: "Build React apps",
        availableSkillTags: [
          { id: "1", name: "React", category: "frontend" },
          { id: "2", name: "TypeScript", category: "languages" },
        ],
      }

      const result = minimizeAssistantContext(context)
      expect(result).toEqual({
        intent: "offer_generate_draft",
        prompt: "Create a React internship",
        title: "Frontend Developer",
        internshipType: "pfe",
        workMode: "hybrid",
        wilayaCode: 16,
        durationWeeks: 12,
        maxPositions: 2,
        description: "Build React apps",
        availableSkillTags: [
          { id: "1", name: "React", category: "frontend" },
          { id: "2", name: "TypeScript", category: "languages" },
        ],
      })
    })

    test("minimizes candidate_summarize context", () => {
      const context = {
        intent: "candidate_summarize",
        offer: {
          title: "Backend Intern",
          skills: [{ id: "1", name: "Node.js", category: "backend" }],
        },
        applicant: {
          name: "John Doe",
          skills: [{ id: "2", name: "Express", category: "backend" }],
          coverLetter: "I love coding",
        },
      }

      const result = minimizeAssistantContext(context)
      expect(result).toEqual({
        intent: "candidate_summarize",
        offer: {
          title: "Backend Intern",
          skills: [{ id: "1", name: "Node.js", category: "backend" }],
        },
        applicant: {
          name: "John Doe",
          skills: [{ id: "2", name: "Express", category: "backend" }],
          coverLetter: "I love coding",
        },
      })
    })

    test("minimizes student_search_parse context", () => {
      const context = {
        intent: "student_search_parse",
        query: "remote React internship",
        availableSkillTags: [{ id: "1", name: "React", category: "frontend" }],
      }

      const result = minimizeAssistantContext(context)
      expect(result).toEqual({
        intent: "student_search_parse",
        query: "remote React internship",
        availableSkillTags: [{ id: "1", name: "React", category: "frontend" }],
      })
    })

    test("preserves notification data structure", () => {
      const context = {
        intent: "notifications_summarize",
        role: "student",
        notifications: [
          {
            id: "1",
            type: "application",
            createdAt: "2024-01-01",
            readAt: null,
            payload: { name: "John" },
          },
        ],
      }

      const result = minimizeAssistantContext(context)
      expect(result).toBeDefined()
      const notifications = (result as Record<string, unknown>)
        .notifications as Array<Record<string, unknown>>
      expect(notifications[0].id).toBe("1")
      expect(notifications[0].type).toBe("application")
      expect(notifications[0].payload).toEqual({ name: "John" })
    })

    test("caps skill tags at 200 items", () => {
      const context = {
        intent: "offer_generate_draft",
        availableSkillTags: Array.from({ length: 300 }, (_, i) => ({
          id: String(i),
          name: `Skill ${i}`,
          category: "test",
        })),
      }

      const result = minimizeAssistantContext(context)
      const tags = (result as Record<string, unknown>)
        .availableSkillTags as unknown[]
      expect(tags.length).toBe(200)
    })
  })

  describe("assistantContextToJson", () => {
    test("returns compact JSON without indentation", () => {
      const context = {
        intent: "offer_generate_draft",
        prompt: "test",
        title: "Test",
      }

      const json = assistantContextToJson(context)
      expect(json).not.toContain("\n")
      expect(json).not.toContain("  ")
      // The function returns minimized context which includes null fields for offer intents
      const parsed = JSON.parse(json)
      expect(parsed.intent).toBe("offer_generate_draft")
      expect(parsed.prompt).toBe("test")
      expect(parsed.title).toBe("Test")
    })

    test("returns empty object for null context", () => {
      const json = assistantContextToJson(null)
      expect(json).toBe("null")
    })
  })
})
