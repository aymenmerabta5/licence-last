import { describe, test, expect } from "bun:test"

import { createStudentProfileSchema } from "@/lib/schemas/student"

function t(key: string) {
  return `t:${key}`
}

describe("src/lib/schemas/student", () => {
  describe("createStudentProfileSchema", () => {
    test("should accept valid input with skills array", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        bio: "A passionate developer",
        phone: "0555123456",
        githubUrl: "https://github.com/student",
        portfolioUrl: "https://student.dev",
        studentNumber: "STU001",
        department: "Computer Science",
        level: "L3",
        wilayaCode: 25,
        address: "123 Main Street",
        skillTagIds: ["skill-1", "skill-2", "skill-3"],
      })

      expect(result.success).toBe(true)
    })

    test("should accept minimal input (only required: skillTagIds with 1+ items)", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        skillTagIds: ["skill-1"],
      })

      expect(result.success).toBe(true)
    })

    test("should reject empty skillTagIds array", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        skillTagIds: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "skillTagIds")
        expect(issue?.message).toBe("t:skillsMin")
      }
    })

    test("should reject more than 10 skills", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        skillTagIds: Array.from({ length: 11 }, (_, i) => `skill-${i}`),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "skillTagIds")
        expect(issue?.message).toBe("t:skillsMax")
      }
    })

    test("should reject invalid githubUrl", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        githubUrl: "not-a-url",
        skillTagIds: ["skill-1"],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "githubUrl")
        expect(issue?.message).toBe("t:githubUrlInvalid")
      }
    })

    test("should reject invalid portfolioUrl", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        portfolioUrl: "not-a-url",
        skillTagIds: ["skill-1"],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "portfolioUrl")
        expect(issue?.message).toBe("t:portfolioUrlInvalid")
      }
    })

    test("should accept empty string githubUrl and portfolioUrl", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        githubUrl: "",
        portfolioUrl: "",
        skillTagIds: ["skill-1"],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.githubUrl).toBe("")
        expect(result.data.portfolioUrl).toBe("")
      }
    })

    test("should coerce wilayaCode from string to number", () => {
      const schema = createStudentProfileSchema(t)
      const result = schema.safeParse({
        wilayaCode: "25",
        skillTagIds: ["skill-1"],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.wilayaCode).toBe(25)
      }
    })
  })
})
