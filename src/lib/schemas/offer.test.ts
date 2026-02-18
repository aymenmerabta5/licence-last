import { describe, test, expect } from "bun:test"

import { createOfferSchema, createCompanyProfileSchema } from "@/lib/schemas/offer"

function t(key: string) {
  return `t:${key}`
}

const DEFAULT_LANGUAGE_REQUIREMENTS = [
  { languageCode: "en", minimumProficiency: "b2" as const },
]

describe("src/lib/schemas/offer", () => {
  describe("createOfferSchema", () => {
    const schema = createOfferSchema(t)

    test("should accept valid offer with all fields", () => {
      const result = schema.safeParse({
        title: "Frontend Developer Intern",
        description: "Join our team to work on exciting web projects",
        internshipType: "pfe",
        workMode: "hybrid",
        wilayaCode: 16,
        durationWeeks: 12,
        maxPositions: 3,
        applicationDeadlineAt: "2030-01-01",
        expectedStartDate: "2030-01-10",
        expectedEndDate: "2030-04-10",
        skillTagIds: ["skill-1", "skill-2"],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(true)
    })

    test("should accept minimal valid offer (title + description + type)", () => {
      const result = schema.safeParse({
        title: "Intern",
        description: "Work with us on real projects",
        internshipType: "summer",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(true)
    })

    test("should reject missing title", () => {
      const result = schema.safeParse({
        description: "Some description here",
        internshipType: "pfe",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
    })

    test("should reject short title (< 3 chars)", () => {
      const result = schema.safeParse({
        title: "AB",
        description: "Some description here",
        internshipType: "pfe",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "title")
        expect(issue?.message).toBe("t:offerTitleMin")
      }
    })

    test("should reject short description (< 10 chars)", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "Short",
        internshipType: "pfe",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "description")
        expect(issue?.message).toBe("t:offerDescriptionMin")
      }
    })

    test("should reject invalid internshipType", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "invalid_type",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
    })

    test("should accept all valid internship types", () => {
      for (const type of ["pfe", "immersion", "summer", "practical"]) {
        const result = schema.safeParse({
          title: "Good Title",
          description: "A long enough description",
          internshipType: type,
          skillTagIds: [],
          languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
        })
        expect(result.success).toBe(true)
      }
    })

    test("should reject wilayaCode out of range", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        wilayaCode: 99,
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
    })

    test("should reject too many skills (> 20)", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        skillTagIds: Array.from({ length: 21 }, (_, i) => `skill-${i}`),
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "skillTagIds")
        expect(issue?.message).toBe("t:offerSkillsMax")
      }
    })

    test("should reject empty language requirements when feature is enabled", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        skillTagIds: [],
        languageRequirements: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "languageRequirements")
        expect(issue?.message).toBe("t:offerLanguageRequirementsMin")
      }
    })

    test("should accept empty language requirements when feature is disabled", () => {
      const relaxedSchema = createOfferSchema(t, {
        requireLanguageRequirements: false,
      })
      const result = relaxedSchema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        skillTagIds: [],
        languageRequirements: [],
      })

      expect(result.success).toBe(true)
    })

    test("should reject language weight above allowed range", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        skillTagIds: [],
        languageRequirements: [
          {
            languageCode: "en",
            minimumProficiency: "b2",
            weight: 9,
            isRequired: true,
          },
        ],
      })

      expect(result.success).toBe(false)
    })

    test("should accept valid language metadata fields", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        skillTagIds: [],
        languageRequirements: [
          {
            languageCode: "en",
            minimumProficiency: "b2",
            weight: 4,
            isRequired: false,
          },
        ],
      })

      expect(result.success).toBe(true)
    })

    test("should coerce durationWeeks from string to number", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        durationWeeks: "8",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.durationWeeks).toBe(8)
      }
    })

    test("should reject incomplete expected period", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        expectedStartDate: "2030-01-10",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "expectedEndDate")
        expect(issue?.message).toBe("t:expectedPeriodBothRequired")
      }
    })

    test("should reject expected start date after expected end date", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        expectedStartDate: "2030-02-10",
        expectedEndDate: "2030-01-10",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "expectedEndDate")
        expect(issue?.message).toBe("t:expectedPeriodInvalid")
      }
    })

    test("should reject deadline after expected start date", () => {
      const result = schema.safeParse({
        title: "Good Title",
        description: "A long enough description",
        internshipType: "pfe",
        applicationDeadlineAt: "2030-02-01",
        expectedStartDate: "2030-01-10",
        expectedEndDate: "2030-03-10",
        skillTagIds: [],
        languageRequirements: DEFAULT_LANGUAGE_REQUIREMENTS,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "applicationDeadlineAt")
        expect(issue?.message).toBe("t:deadlineAfterExpectedStart")
      }
    })
  })

  describe("createCompanyProfileSchema", () => {
    const schema = createCompanyProfileSchema(t)

    test("should accept valid profile with all fields", () => {
      const result = schema.safeParse({
        description: "We are a tech company",
        logoUrl: "https://example.com/logo.png",
        websiteUrl: "https://example.com",
        phone: "0555123456",
        contactEmail: "contact@example.com",
        representativeName: "John Doe",
        wilayaCode: 16,
        address: "123 Main Street, Algiers",
      })

      expect(result.success).toBe(true)
    })

    test("should accept empty profile (all optional)", () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
    })

    test("should reject invalid email", () => {
      const result = schema.safeParse({
        contactEmail: "not-an-email",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "contactEmail")
        expect(issue?.message).toBe("t:emailInvalid")
      }
    })

    test("should reject invalid websiteUrl", () => {
      const result = schema.safeParse({
        websiteUrl: "not-a-url",
      })

      expect(result.success).toBe(false)
    })

    test("should accept empty strings for url/email fields", () => {
      const result = schema.safeParse({
        logoUrl: "",
        websiteUrl: "",
        contactEmail: "",
      })

      expect(result.success).toBe(true)
    })

    test("should reject wilayaCode above 58", () => {
      const result = schema.safeParse({
        wilayaCode: 59,
      })

      expect(result.success).toBe(false)
    })

    test("should accept wilayaCode boundaries (1 and 58)", () => {
      expect(schema.safeParse({ wilayaCode: 1 }).success).toBe(true)
      expect(schema.safeParse({ wilayaCode: 58 }).success).toBe(true)
    })
  })
})
